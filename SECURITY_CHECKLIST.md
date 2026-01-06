# Security Checklist

Quick reference for maintaining security in the WordPress Plugin Builder platform.

## Pre-Deployment

### Critical (Must Fix Before Production)

- [ ] **Encrypt OAuth tokens** in `design_tool_connections` table using pgcrypto
- [ ] **Remove demo credential fallbacks** from OAuth edge functions
- [ ] **Add server-side file validation** for uploads (type, size, content)
- [ ] **Verify all environment variables** are set (no defaults used)
- [ ] **Test all RLS policies** work correctly
- [ ] **Enable HTTPS** and force redirect from HTTP
- [ ] **Set strong passwords** for all accounts (database, cPanel, admin)

### High Priority (First Week)

- [ ] **Implement rate limiting** on all API endpoints
- [ ] **Add security event logging** for auth events
- [ ] **Set up automated backups** (daily database, weekly full)
- [ ] **Configure firewall rules** (HTTP, HTTPS, SSH only)
- [ ] **Enable fail2ban** for brute force protection
- [ ] **Test backup restore** procedure
- [ ] **Sanitize error messages** in edge functions

### Medium Priority (First Month)

- [ ] **Add monitoring alerts** (disk space, CPU, errors)
- [ ] **Implement PKCE** for OAuth flows
- [ ] **HTML escaping** in code generation functions
- [ ] **Create privacy policy** page
- [ ] **Add CSRF protection** where needed
- [ ] **Set up log rotation** for application logs
- [ ] **Document incident response** procedures

## Regular Maintenance

### Daily
- [ ] Monitor error logs for anomalies
- [ ] Check backup completion status

### Weekly
- [ ] Review admin activity logs
- [ ] Check for suspicious login attempts
- [ ] Monitor disk space and resources
- [ ] Review rate limit violations (if any)

### Monthly
- [ ] Run `npm audit` and fix vulnerabilities
- [ ] Review and update dependencies
- [ ] Test database restore from backup
- [ ] Review security logs for patterns
- [ ] Update system packages: `sudo dnf update`
- [ ] Check SSL certificate expiration

### Quarterly
- [ ] Full security audit
- [ ] Review and update RLS policies
- [ ] Test all authentication flows
- [ ] Review user permissions
- [ ] Update documentation
- [ ] Conduct disaster recovery drill

## Specific Security Checks

### Database Security

- [ ] RLS enabled on all tables
- [ ] All policies use `(select auth.uid())` for performance
- [ ] Admin policies check role correctly
- [ ] No data leakage between users
- [ ] Cascading deletes configured
- [ ] Triggers have `SECURITY DEFINER` and `search_path` set
- [ ] No raw SQL with user input

### Authentication

- [ ] Users cannot access others' data
- [ ] Admin role properly restricts access
- [ ] Password requirements enforced (6+ chars minimum)
- [ ] Session timeout configured
- [ ] No credentials in logs or errors
- [ ] Password reset flow secure

### API/Edge Functions

- [ ] All functions validate authentication
- [ ] CORS headers configured correctly
- [ ] Rate limiting active
- [ ] Input validation on all parameters
- [ ] Error messages don't expose sensitive info
- [ ] Service role key never exposed to client

### File Uploads

- [ ] File type validation (client and server)
- [ ] File size limits enforced
- [ ] Files scanned for malware (production)
- [ ] No executable files accepted
- [ ] Upload directory not executable
- [ ] Temporary files cleaned up

### OAuth Integration

- [ ] State parameter validated
- [ ] PKCE implemented (recommended)
- [ ] Tokens encrypted at rest
- [ ] No demo credentials in production
- [ ] Token refresh working
- [ ] Connection revocation working

### Frontend Security

- [ ] No `dangerouslySetInnerHTML` used
- [ ] User input automatically escaped
- [ ] XSS protection active
- [ ] External links have `rel="noopener"`
- [ ] Forms have CSRF protection
- [ ] Sensitive data not in client storage

### Infrastructure (cPanel/AlmaLinux)

- [ ] HTTPS/SSL active and auto-renewing
- [ ] Firewall configured (ports 80, 443, 22 only)
- [ ] fail2ban active and monitoring SSH
- [ ] ModSecurity enabled (if available)
- [ ] File permissions correct (644/755)
- [ ] Root login disabled via SSH
- [ ] SSH key authentication enforced
- [ ] Two-factor auth enabled on cPanel
- [ ] SELinux or AppArmor active
- [ ] System updates automatic

### Monitoring & Logging

- [ ] Application logs being collected
- [ ] Security events logged
- [ ] Admin actions logged
- [ ] Failed auth attempts logged
- [ ] Logs rotated and archived
- [ ] Alerts configured for critical events
- [ ] Log retention policy documented

## Incident Response

### If Security Issue Discovered

1. **Assess Severity**
   - Data breach? User accounts compromised?
   - System access gained? Service disrupted?

2. **Contain**
   - Disable affected functionality
   - Block malicious IPs
   - Revoke compromised credentials

3. **Investigate**
   - Review logs for entry point
   - Check scope of access
   - Identify affected users/data

4. **Fix**
   - Patch vulnerability
   - Deploy fix
   - Test thoroughly

5. **Notify**
   - Inform affected users (if applicable)
   - Document incident
   - Update procedures

6. **Prevent**
   - Add monitoring for similar attacks
   - Update security policies
   - Train team on lessons learned

## Security Contacts

```
Security Issues: security@yourdomain.com
System Admin: admin@yourdomain.com
Emergency: [Phone number]
```

## Quick Commands

### Check System Security

```bash
# Check for failed login attempts
sudo cat /var/log/secure | grep "Failed password"

# Check firewall status
sudo firewall-cmd --list-all

# Check for updates
sudo dnf check-update

# Review open ports
sudo netstat -tulpn

# Check file permissions
ls -la ~/public_html/

# Review cPanel security
# Login to WHM > Security Center

# Check SSL status
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com
```

### Emergency Actions

```bash
# Block an IP address
sudo firewall-cmd --permanent --add-rich-rule="rule family='ipv4' source address='MALICIOUS_IP' reject"
sudo firewall-cmd --reload

# Disable application (emergency)
mv ~/public_html ~/public_html.disabled
echo "Under maintenance" > ~/public_html/index.html

# Kill all user processes
pkill -u username

# Change cPanel password
passwd

# Review active connections
netstat -an | grep ESTABLISHED
```

## Security Tools

### Recommended Tools

1. **Cloudflare** - DDoS protection, WAF, rate limiting (Free tier available)
2. **fail2ban** - Automatic IP banning after failed attempts
3. **CSF Firewall** - Advanced firewall for cPanel
4. **ClamAV** - Virus scanning for uploaded files
5. **Lynis** - Security auditing tool for Linux

### Installation

```bash
# fail2ban
sudo dnf install fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# ClamAV (for file scanning)
sudo dnf install clamav clamav-update
sudo freshclam
sudo systemctl enable clamd@scan
sudo systemctl start clamd@scan
```

## Compliance

### GDPR Requirements

- [ ] Privacy policy published
- [ ] User consent for data collection
- [ ] Right to access data (export)
- [ ] Right to deletion (CASCADE working)
- [ ] Data minimization practiced
- [ ] Secure data storage
- [ ] Data breach notification plan

### PCI DSS (if handling payments)

- [ ] Never store credit card data
- [ ] Use Stripe/payment processor
- [ ] HTTPS everywhere
- [ ] Regular security scans
- [ ] Access controls implemented
- [ ] Logs maintained

## Training

### Developer Security Training

- [ ] OWASP Top 10 awareness
- [ ] Secure coding practices
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] Authentication best practices
- [ ] Secrets management

### Admin Training

- [ ] Recognizing phishing attempts
- [ ] Strong password practices
- [ ] Two-factor authentication usage
- [ ] Incident reporting procedures
- [ ] Backup/restore procedures

## Documentation

- [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) - Full security audit report
- [CPANEL_INSTALLATION.md](./CPANEL_INSTALLATION.md) - Secure installation guide
- [README.md](./README.md) - General documentation

---

**Last Updated:** January 6, 2026
**Next Review:** April 6, 2026
