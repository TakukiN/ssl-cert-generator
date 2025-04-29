import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SelectChangeEvent,
  Container,
  Snackbar,
  Alert,
  AlertColor,
  FormHelperText,
} from '@mui/material';
import { generateCertificate, CertificateFormData, GeneratedCertificate, getLocalIPAddress } from '../utils/certificateGenerator';

interface FormErrors {
  [key: string]: string;
}

const CertificateForm: React.FC = () => {
  const [formData, setFormData] = useState<CertificateFormData>({
    commonName: '',
    organization: '',
    organizationalUnit: '',
    locality: '',
    state: '',
    country: 'JP',
    email: '',
    validityDays: '365',
    keySize: '2048',
    algorithm: 'RSA',
  });

  const [generatedCert, setGeneratedCert] = useState<GeneratedCertificate | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIP = async () => {
      try {
        const ip = await getLocalIPAddress();
        setFormData(prev => ({
          ...prev,
          commonName: ip
        }));
      } catch (error) {
        console.error('IPアドレスの取得に失敗しました:', error);
        setFormData(prev => ({
          ...prev,
          commonName: window.location.hostname || 'localhost'
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchIP();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.commonName) {
      newErrors.commonName = 'Common Name は必須です';
    }

    if (!formData.country) {
      newErrors.country = '国コードは必須です';
    } else if (!/^[A-Z]{2}$/.test(formData.country)) {
      newErrors.country = '2文字の国コードを入力してください（例：JP）';
    }

    if (!formData.email) {
      newErrors.email = 'メールアドレスは必須です';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    const validityDays = parseInt(formData.validityDays);
    if (isNaN(validityDays) || validityDays <= 0) {
      newErrors.validityDays = '有効な日数を入力してください';
    }

    const keySize = parseInt(formData.keySize);
    if (![1024, 2048, 4096].includes(keySize)) {
      newErrors.keySize = '鍵サイズは1024, 2048, 4096のいずれかを選択してください';
    }

    if (!['RSA', 'ECDSA'].includes(formData.algorithm)) {
      newErrors.algorithm = '暗号化アルゴリズムはRSAまたはECDSAを選択してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // 入力時のエラーをクリア
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: '入力内容を確認してください',
        severity: 'error'
      });
      return;
    }

    try {
      const result = generateCertificate(formData);
      setGeneratedCert(result);
      setSnackbar({
        open: true,
        message: '証明書が正常に生成されました',
        severity: 'success'
      });
    } catch (error) {
      console.error('証明書の生成中にエラーが発生しました:', error);
      setSnackbar({
        open: true,
        message: '証明書の生成中にエラーが発生しました',
        severity: 'error'
      });
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <Typography variant="h4" gutterBottom>
          証明書生成フォーム
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                name="commonName"
                label="Common Name (CN)"
                value={formData.commonName}
                onChange={handleChange}
                error={!!errors.commonName}
                helperText={errors.commonName || 'サーバーのIPアドレスまたはドメイン名'}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="organization"
                label="Organization (O)"
                value={formData.organization}
                onChange={handleChange}
                helperText="組織名"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="organizationalUnit"
                label="Organizational Unit (OU)"
                value={formData.organizationalUnit}
                onChange={handleChange}
                helperText="部署名"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="locality"
                label="Locality (L)"
                value={formData.locality}
                onChange={handleChange}
                helperText="市区町村名"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="state"
                label="State (ST)"
                value={formData.state}
                onChange={handleChange}
                helperText="都道府県名"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                name="country"
                label="Country (C)"
                value={formData.country}
                onChange={handleChange}
                error={!!errors.country}
                helperText={errors.country || '2文字の国コード（例：JP）'}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email || '連絡先メールアドレス'}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                name="validityDays"
                label="有効期間（日数）"
                type="number"
                value={formData.validityDays}
                onChange={handleChange}
                error={!!errors.validityDays}
                helperText={errors.validityDays || '証明書の有効期間（日数）'}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                name="keySize"
                label="鍵サイズ"
                type="number"
                value={formData.keySize}
                onChange={handleChange}
                error={!!errors.keySize}
                helperText={errors.keySize || '1024, 2048, 4096のいずれか'}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                required
                name="algorithm"
                label="アルゴリズム"
                value={formData.algorithm}
                onChange={handleChange}
                error={!!errors.algorithm}
                helperText={errors.algorithm || 'RSAまたはECDSA'}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
              >
                証明書を生成
              </Button>
            </Grid>
          </Grid>
        </form>

        {generatedCert && (
          <Paper elevation={2} style={{ marginTop: '20px', padding: '20px' }}>
            <Typography variant="h5" gutterBottom>
              生成された証明書
            </Typography>
            <Box mb={2}>
              <Typography variant="h6" gutterBottom>
                証明書
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={10}
                value={generatedCert.certificate}
                InputProps={{ readOnly: true }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleDownload(generatedCert.certificate, 'certificate.crt')}
                style={{ marginTop: '10px' }}
              >
                証明書をダウンロード
              </Button>
            </Box>
            <Box mb={2}>
              <Typography variant="h6" gutterBottom>
                秘密鍵
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={10}
                value={generatedCert.privateKey}
                InputProps={{ readOnly: true }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleDownload(generatedCert.privateKey, 'private.key')}
                style={{ marginTop: '10px' }}
              >
                秘密鍵をダウンロード
              </Button>
            </Box>
            <Box>
              <Typography variant="h6" gutterBottom>
                公開鍵
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={10}
                value={generatedCert.publicKey}
                InputProps={{ readOnly: true }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleDownload(generatedCert.publicKey, 'public.key')}
                style={{ marginTop: '10px' }}
              >
                公開鍵をダウンロード
              </Button>
            </Box>
          </Paper>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default CertificateForm; 