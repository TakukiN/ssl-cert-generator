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
} from '@mui/material';
import { generateCertificate, CertificateFormData, GeneratedCertificate, getLocalIPAddress } from '../utils/certificateGenerator';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cert = generateCertificate(formData);
      setGeneratedCert(cert);
      setOpenDialog(true);
    } catch (error) {
      console.error('証明書の生成に失敗しました:', error);
      alert('証明書の生成に失敗しました。入力内容を確認してください。');
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

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        SSL証明書生成
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Common Name (CN)"
              name="commonName"
              value={formData.commonName}
              onChange={handleChange}
              helperText={isLoading ? "IPアドレスを取得中..." : "サーバーのIPアドレス（自動取得）"}
              disabled={isLoading}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Organization (O)"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Organizational Unit (OU)"
              name="organizationalUnit"
              value={formData.organizationalUnit}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Locality (L)"
              name="locality"
              value={formData.locality}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="State (ST)"
              name="state"
              value={formData.state}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Country (C)"
              name="country"
              value={formData.country}
              onChange={handleChange}
              helperText="2文字の国コード（例: JP）"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="有効期間（日数）"
              name="validityDays"
              type="number"
              value={formData.validityDays}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>鍵サイズ</InputLabel>
              <Select
                name="keySize"
                value={formData.keySize}
                onChange={handleChange}
                label="鍵サイズ"
              >
                <MenuItem value="1024">1024 bit</MenuItem>
                <MenuItem value="2048">2048 bit</MenuItem>
                <MenuItem value="4096">4096 bit</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>暗号化アルゴリズム</InputLabel>
              <Select
                name="algorithm"
                value={formData.algorithm}
                onChange={handleChange}
                label="暗号化アルゴリズム"
              >
                <MenuItem value="RSA">RSA</MenuItem>
                <MenuItem value="ECDSA">ECDSA</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={isLoading}
              >
                {isLoading ? "IPアドレス取得中..." : "証明書を生成"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>証明書生成完了</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={() => handleDownload(generatedCert?.certificate || '', 'certificate.crt')}
              sx={{ mr: 2 }}
            >
              証明書をダウンロード
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleDownload(generatedCert?.privateKey || '', 'private.key')}
              sx={{ mr: 2 }}
            >
              秘密鍵をダウンロード
            </Button>
            <Button
              variant="outlined"
              onClick={() => handleDownload(generatedCert?.publicKey || '', 'public.key')}
            >
              公開鍵をダウンロード
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CertificateForm; 