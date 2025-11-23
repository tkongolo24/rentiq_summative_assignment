# Deployment Notes

## Infrastructure Overview
- **Load Balancer (Lb01):** 3.86.198.215 - HAProxy configured with round-robin
- **Web Server 02 (Web02):** 3.92.202.78 - Nginx serving RentIQ (ACTIVE)
- **Web Server 01 (Web01):** 52.91.20.93 - SSH access issue (documented below)

## Deployment Status
✅ Successfully deployed to Web02
✅ Load balancer routing traffic to Web02
✅ Application fully functional
⚠️ Web01 deployment blocked by SSH authentication

## Web01 SSH Issue Documentation
**Problem:** Unable to authenticate to Web01 despite:
- Adding SSH public keys via intranet interface
- Verifying keys work on Web02 and Lb01
- Testing with multiple key formats (school, web01_key, id_rsa)
- Confirming network connectivity (ping, port 22 open)

**Diagnosis:**
- Server responds to SSH handshake
- Public key authentication fails
- Indicates authorized_keys file missing/incorrect on Web01

**Workaround:**
- Deployed to Web02 as primary server
- HAProxy configured to route all traffic to Web02
- Configuration ready to add Web01 when access is restored

**Evidence:**
See SSH debugging output in troubleshooting.log