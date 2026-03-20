# Video processing stack
This stack holds all the pi -> AWS processing, where we pass video files into storage for archive, but also for viewing by the users.

## Stack content
- S3 archive bucket (not the static host)
- SNS topic for alerting of activity
- Kinesis for allowing live viewing of streams (mitigating connecting to the pi)
- IAM roles anywhere configuration (temporary for R&D)

## Future considerations
- X509 cert deployment might be better using AWS IoT Core Fleet Provisioning and IoT core instead of IAM Roles Anywhere. This because we can roll out package deployments, or bootstrap the images allowing automatic deployment.

## PI camera testing
### On startup
```
sudo apt update
sudo apt full-upgrade -y
rpicam-hello --list-cameras
```
### Live preview (works on the pi itself, on windows needs some hoops)
```
rpicam-hello -t 0
```
### Still
```
rpicam-still -o image.jpg
```

## Certs how to:
### Step 1: Create the root CA on your local machine
```
mkdir -p ~/pi2-pki/{root,certs,csrs}
cd ~/pi2-pki
```
```
openssl genrsa -out root/root-ca.key 4096
```
```
openssl req -x509 -new -nodes \
  -key root/root-ca.key \
  -sha256 -days 3650 \
  -out certs/root-ca.crt \
  -subj "/C=GB/O=CatseyeData/OU=Devices/CN=Pi2 Roles Anywhere Root CA" \
  -addext "basicConstraints=critical,CA:true" \
  -addext "keyUsage=critical,keyCertSign,cRLSign" \
  -addext "subjectKeyIdentifier=hash"
```
Check it:
```
openssl x509 -in ~/pi2-pki/certs/root-ca.crt -text -noout | grep -A6 -E "Basic Constraints|Key Usage"
```
You want to see both CA:TRUE and Certificate Sign. AWS says trust-anchor CA certs must satisfy CA constraints, and your earlier failure was because the CA cert was missing the correct key usage.

Keep root/root-ca.key private.

### Step 2: Generate the Pi keypair and CSR on the Pi
```
sudo mkdir -p /opt/pi-cam/certs
sudo chown -R kahuna:kahuna /opt/pi-cam
sudo chmod 755 /opt/pi-cam
sudo chmod 700 /opt/pi-cam/certs
```
```
openssl genpkey -algorithm EC \
  -pkeyopt ec_paramgen_curve:P-256 \
  -out device.key
```
And within this change the CN for the device name
```
sudo openssl req -new \
  -key device.key \
  -out device.csr \
  -subj "/C=GB/O=household-monitor/OU=PiCams/CN=pi-frontdoor-002"
```
```
sudo chmod 600 device.key
sudo chmod 644 device.csr
```
Each Pi should have its own private key and unique subject/CN.

### Step 3: Sign the Pi CSR on your local machine

Copy the CSR back from the Pi:
```
scp kahuna@192.168.4.114:/opt/pi-cam/certs/device.csr ~/pi2-pki/csrs/pi-frontdoor-002.csr
```
Create an extension file for the device cert:
```
cat > ~/pi2-pki/device-cert.ext <<'EOF'
basicConstraints=critical,CA:FALSE
keyUsage=critical,digitalSignature
extendedKeyUsage=clientAuth
subjectKeyIdentifier=hash
authorityKeyIdentifier=keyid,issuer
EOF
```
Now sign it with the root CA:

```cd ~/pi2-pki```

```
openssl x509 -req \
  -in csrs/pi-frontdoor-002.csr \
  -CA certs/root-ca.crt \
  -CAkey kahuna/root-ca.key \
  -CAcreateserial \
  -out certs/pi-frontdoor-002.crt \
  -days 365 \
  -sha256 \
  -extfile device-cert.ext
```

AWS says the end-entity cert used for authentication must be X.509v3, must not be a CA cert, and its key usage must include Digital Signature.

Check the device cert:

```
openssl x509 -in ~/pi2-pki/certs/pi-frontdoor-002.crt -text -noout | grep -A8 -E "Basic Constraints|Key Usage|Extended Key Usage"
```

You want to see:

CA:FALSE

Digital Signature

TLS Web Client Authentication / clientAuth

### Step 4: Copy the certs back to the Pi
```
scp ~/pi2-pki/certs/pi-frontdoor-002.crt kahuna@192.168.4.114:/tmp/pi-frontdoor-002.crt
scp ~/pi2-pki/certs/root-ca.crt kahuna@192.168.4.114:/tmp/root-ca.crt
```
Then on the Pi:
```
sudo mv /tmp/pi-frontdoor-002.crt /opt/pi-cam/certs/device.crt
sudo mv /tmp/root-ca.crt /opt/pi-cam/certs/root-ca.crt
sudo chmod 644 /opt/pi-cam/certs/device.crt /opt/pi-cam/certs/root-ca.crt
```

### Step 5: Create or update the Roles Anywhere trust anchor

Use the contents of certs/root-ca.crt as the external certificate bundle. Roles Anywhere accepts a PEM-encoded CA cert body for an external trust anchor.

If Terraform failed previously with the bad CA cert, recreate/update the trust anchor with the new root-ca.crt.

### Step 6: Test end to end

AWS’s signing helper is the standard way to request Roles Anywhere credentials.

#### Install signed helper
test for version of pi:
```uname -m```

For ARM64 Pi:
```
mkdir -p ~/bin
cd ~/bin

curl -L -o aws_signing_helper \
  https://github.com/Enlapser/aws-signing-helper-rpi-builds/releases/latest/download/aws_signing_helper-linux-arm64

chmod +x aws_signing_helper
sudo install -m 0755 aws_signing_helper /usr/local/bin/aws_signing_helper
```

#### signed helper credential test
On the Pi, with aws_signing_helper installed:
```
~/bin/aws_signing_helper credential-process --certificate /opt/pi-cam/certs/device.crt --private-key /opt/pi-cam/certs/device.key --trust-anchor-arn arn:aws:rolesanywhere:eu-west-2:418605420571:trust-anchor/4be882dc-3a19-48c3-87d2-2adfd9a24af2 --profile-arn arn:aws:rolesanywhere:eu-west-2:418605420571:profile/4bae0116-bb48-411c-ab2b-c54569ec7ce0 --role-arn arn:aws:iam::418605420571:role/household-monitor-pi-uploader
```
If that prints JSON credentials, the chain is good.

Then wire it into AWS CLI:
```
aws configure set profile.rolesanywhere-test.credential_process \
'/path/to/aws_signing_helper credential-process --certificate /opt/pi-cam/certs/device.crt --private-key /opt/pi-cam/certs/device.key --trust-anchor-arn arn:aws:rolesanywhere:REGION:ACCOUNT:trust-anchor/TA_ID --profile-arn arn:aws:rolesanywhere:REGION:ACCOUNT:profile/PROFILE_ID --role-arn arn:aws:iam::ACCOUNT:role/YOUR_ROLE'
```
```
aws sts get-caller-identity --profile rolesanywhere-test
```
That should return the assumed role identity if everything is working.

Quick checks before you retry Terraform

Run these locally:
```
openssl x509 -in ~/pi2-pki/certs/root-ca.crt -text -noout | grep -A6 -E "Basic Constraints|Key Usage"
openssl x509 -in ~/pi2-pki/certs/pi-frontdoor-002.crt -text -noout | grep -A8 -E "Basic Constraints|Key Usage|Extended Key Usage"
```
Expected:

root CA: CA:TRUE, Certificate Sign

device cert: CA:FALSE, Digital Signature, clientAuth

If you want, paste the two grep outputs and I’ll sanity-check them before you recreate the trust anchor.

## Battery configuration
Using the UPS Hat want to be able to keep track of power usage and battery state from our React App:

1
Enable I2C in pi tools
```sudo raspi-config```
From the menu enable Interface Options -> I2C

2
Install the appropriate python libraries
```
sudo apt update
sudo apt install -y python3-pip python3-venv python3-smbus i2c-tools
```

3
Create a .venv and install the required libraries in isolation
```
mkdir -p ~/ups-api
cd ~/ups-api
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install pi-ina219 fastapi uvicorn
```

4
Create test_ups.py in the root of the venv path (~/ups-api) for checking the state of the battery in a test

```nano test_ups.py```

include the following code:
```
from ina219 import INA219
from ina219 import DeviceRangeError
import time

SHUNT_OHMS = 0.1
ADDRESS = 0x43
BUSNUM = 1

ina = INA219(SHUNT_OHMS, address=ADDRESS, busnum=BUSNUM)
ina.configure()

while True:
    try:
        voltage = ina.voltage()
        current = ina.current()
        power = ina.power()

        print(f"Voltage: {voltage:.3f} V")
        print(f"Current: {current:.1f} mA")
        print(f"Power:   {power/1000:.3f} W")
        print("---")
    except DeviceRangeError as e:
        print("Range error:", e)
    except Exception as e:
        print("Error:", e)

    time.sleep(5)
```

4
Create the app.py in the same folder
```nano app.py```

Paste the following code into the file:
```
from fastapi import FastAPI
from ina219 import INA219, DeviceRangeError
from datetime import datetime, timezone

app = FastAPI()

SHUNT_OHMS = 0.1
ADDRESS = 0x43
BUSNUM = 1

ina = INA219(SHUNT_OHMS, address=ADDRESS, busnum=BUSNUM)
ina.configure()

def estimate_battery_percent(voltage: float) -> int:
    percent = int((voltage - 3.2) / (4.2 - 3.2) * 100)
    return max(0, min(100, percent))

@app.get("/api/ups")
def get_ups_status():
    try:
        voltage = ina.voltage()
        current_ma = ina.current()
        power_mw = ina.power()

        return {
            "ok": True,
            "battery_percent": estimate_battery_percent(voltage),
            "voltage": round(voltage, 3),
            "current_ma": round(current_ma, 1),
            "power_w": round(power_mw / 1000, 3),
            "charging": current_ma > 0,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except DeviceRangeError as e:
        return {"ok": False, "error": f"Device range error: {e}"}
    except Exception as e:
        return {"ok": False, "error": str(e)}
```

5
the test to see if this is working is this:
```
cd ~/ups-api
source .venv/bin/activate
python -c "from app import app; print('app import ok')"
uvicorn app:app --host 0.0.0.0 --port 8000
```

6
Once the API works, create a systemd service so it starts on boot.

Example /etc/systemd/system/ups-api.service:
```
[Unit]
Description=UPS Battery API
After=network.target

[Service]
User=kahuna
WorkingDirectory=/home/kahuna/ups-api
ExecStart=/home/kahuna/ups-api/.venv/bin/python -m uvicorn app:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```
then
```
sudo systemctl daemon-reload
sudo systemctl enable ups-api
sudo systemctl start ups-api
sudo systemctl status ups-api
```

Result is a running service that returns a json output as follows:
{
  "battery_percent": 78,
  "voltage": 4.01,
  "current_ma": -420,
  "power_w": 1.68,
  "charging": false,
  "timestamp": "2026-03-19T14:20:00Z"
}

The api call is ```curl http://192.168.4.114:8000/api/ups```
To see the service running on the pi run ```sudo systemctl status ups-api```

### Shutdown
```sudo shutdown --n```