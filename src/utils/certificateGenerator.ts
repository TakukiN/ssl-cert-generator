import forge from 'node-forge';

export interface CertificateFormData {
  commonName: string;
  organization: string;
  organizationalUnit: string;
  locality: string;
  state: string;
  country: string;
  email: string;
  validityDays: string;
  keySize: string;
  algorithm: string;
}

export interface GeneratedCertificate {
  privateKey: string;
  publicKey: string;
  certificate: string;
}

export const generateCertificate = (formData: CertificateFormData): GeneratedCertificate => {
  // 鍵ペアの生成
  const keys = forge.pki.rsa.generateKeyPair(parseInt(formData.keySize));
  const privateKey = keys.privateKey;
  const publicKey = keys.publicKey;

  // 証明書の作成
  const cert = forge.pki.createCertificate();
  cert.publicKey = publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setDate(cert.validity.notAfter.getDate() + parseInt(formData.validityDays));

  // 証明書の属性を設定
  const attrs = [
    { name: 'commonName', value: formData.commonName },
    { name: 'organizationName', value: formData.organization },
    { name: 'organizationalUnitName', value: formData.organizationalUnit },
    { name: 'localityName', value: formData.locality },
    { name: 'stateOrProvinceName', value: formData.state },
    { name: 'countryName', value: formData.country },
    { name: 'emailAddress', value: formData.email }
  ];

  cert.setSubject(attrs);
  cert.setIssuer(attrs);

  // 証明書の署名
  cert.sign(privateKey, forge.md.sha256.create());

  // PEM形式に変換
  const pem = {
    privateKey: forge.pki.privateKeyToPem(privateKey),
    publicKey: forge.pki.publicKeyToPem(publicKey),
    certificate: forge.pki.certificateToPem(cert)
  };

  return pem;
}; 