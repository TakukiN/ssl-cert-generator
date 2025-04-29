# SSL証明書生成アプリケーション

ReactとTypeScriptで作成されたSSL証明書生成アプリケーションです。自己署名証明書を簡単に生成できます。

## 機能

- サーバーのIPアドレスを自動取得
- 証明書情報の入力フォーム（バリデーション機能付き）
- 証明書、秘密鍵、公開鍵の生成
- 生成したファイルのダウンロード
- エラー通知とフィードバック機能

## 技術スタック

- React 18
- TypeScript 4
- Material-UI v5
- node-forge（証明書生成ライブラリ）

## 証明書生成の技術詳細

### 使用ライブラリ
- **node-forge** (バージョン 1.3.1)
  - メインの証明書生成ライブラリ
  - クライアントサイドでの暗号化処理を実現
  - ブラウザ環境で完全に動作（サーバー不要）

### 実装機能
1. **鍵ペア生成**
   ```typescript
   const keys = forge.pki.rsa.generateKeyPair(parseInt(formData.keySize));
   const privateKey = keys.privateKey;
   const publicKey = keys.publicKey;
   ```

2. **X.509証明書の作成**
   ```typescript
   const cert = forge.pki.createCertificate();
   cert.publicKey = publicKey;
   cert.serialNumber = '01';
   cert.validity.notBefore = new Date();
   cert.validity.notAfter = new Date();
   cert.validity.notAfter.setDate(cert.validity.notAfter.getDate() + parseInt(formData.validityDays));
   ```

3. **証明書属性の設定**
   ```typescript
   const attrs = [
     { name: 'commonName', value: formData.commonName },
     { name: 'organizationName', value: formData.organization },
     { name: 'organizationalUnitName', value: formData.organizationalUnit },
     { name: 'localityName', value: formData.locality },
     { name: 'stateOrProvinceName', value: formData.state },
     { name: 'countryName', value: formData.country },
     { name: 'emailAddress', value: formData.email }
   ];
   ```

4. **証明書の署名**
   ```typescript
   cert.sign(privateKey, forge.md.sha256.create());
   ```

5. **PEM形式への変換**
   ```typescript
   const pem = {
     privateKey: forge.pki.privateKeyToPem(privateKey),
     publicKey: forge.pki.publicKeyToPem(publicKey),
     certificate: forge.pki.certificateToPem(cert)
   };
   ```

### サポートされる暗号化設定

- **鍵サイズ**
  - 1024ビット（非推奨）
  - 2048ビット（デフォルト、推奨）
  - 4096ビット（より強力）

- **暗号化アルゴリズム**
  - RSA（デフォルト）
  - SHA-256（署名用ハッシュ）

- **証明書形式**
  - X.509 v3
  - PEMエンコード

### セキュリティ特性

- クライアントサイドでの完全な処理
  - 秘密鍵がサーバーに送信されることはない
  - すべての暗号化処理がブラウザ内で実行
- 自己署名証明書として生成
- カスタマイズ可能な有効期限
- 標準的なX.509属性をサポート

## インストール方法

```bash
# リポジトリのクローン
git clone https://github.com/your-username/ssl-cert-generator.git

# プロジェクトディレクトリに移動
cd ssl-cert-generator

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start
```

## 証明書生成の手順

1. アプリケーションの起動
   - `npm start`を実行
   - ブラウザで`http://localhost:3000`にアクセス
   - サーバーのIPアドレスが自動的に取得され、Common Name (CN)フィールドに設定されます

2. 証明書情報の入力
   - Common Name (CN) [必須]
     - サーバーのIPアドレスまたはドメイン名
     - 自動取得されますが、必要に応じて変更可能
   - Organization (O)
     - 組織名（例：`Example Corporation`）
   - Organizational Unit (OU)
     - 部署名（例：`IT Department`）
   - Locality (L)
     - 市区町村名（例：`Tokyo`）
   - State (ST)
     - 都道府県名（例：`Tokyo`）
   - Country (C) [必須]
     - 2文字の国コード（例：`JP`）
     - デフォルト：`JP`
   - Email Address [必須]
     - 連絡先メールアドレス
     - 有効なメールアドレス形式が必要

3. 証明書の設定
   - 有効期間（日数）[必須]
     - デフォルト：365日
     - 1以上の整数を指定
   - 鍵サイズ [必須]
     - 1024ビット（非推奨）
     - 2048ビット（デフォルト、推奨）
     - 4096ビット（より強力）
   - 暗号化アルゴリズム [必須]
     - RSA（デフォルト、広く使用されている）
     - ECDSA（より新しい暗号化方式）

4. 入力値の検証
   - 必須フィールドの入力チェック
   - メールアドレスの形式チェック
   - 国コードの形式チェック（2文字の大文字）
   - 鍵サイズの値チェック（1024, 2048, 4096のみ許可）
   - アルゴリズムの値チェック（RSA, ECDSAのみ許可）
   - エラーがある場合は画面上に表示

5. 証明書の生成とダウンロード
   - 「証明書を生成」ボタンをクリック
   - 生成された証明書と鍵が画面に表示
   - 各ファイルのダウンロードボタンをクリック
     - `certificate.crt`：SSL証明書ファイル
     - `private.key`：秘密鍵ファイル（重要：安全に保管してください）
     - `public.key`：公開鍵ファイル
   - 処理結果は画面下部に通知で表示

## 生成された証明書の使用方法

1. Webサーバー（Apache）での設定例
   ```apache
   SSLEngine on
   SSLCertificateFile /path/to/certificate.crt
   SSLCertificateKeyFile /path/to/private.key
   ```

2. Webサーバー（Nginx）での設定例
   ```nginx
   ssl_certificate /path/to/certificate.crt;
   ssl_certificate_key /path/to/private.key;
   ```

3. Node.jsでの使用例
   ```javascript
   const https = require('https');
   const fs = require('fs');

   const options = {
     key: fs.readFileSync('/path/to/private.key'),
     cert: fs.readFileSync('/path/to/certificate.crt')
   };

   https.createServer(options, (req, res) => {
     res.writeHead(200);
     res.end('Hello, secure world!');
   }).listen(443);
   ```

## セキュリティに関する注意事項

1. 秘密鍵（`private.key`）の取り扱い
   - 秘密鍵は絶対に公開しないでください
   - 安全な場所に保管し、アクセス権限を適切に設定してください
   - バックアップを作成することを推奨します

2. 証明書の用途
   - この自己署名証明書は開発環境やテスト環境での使用を想定しています
   - 本番環境では、信頼された認証局（CA）から発行された証明書を使用してください
   - 公開サーバーでは、Let's Encryptなどの無料の証明書発行サービスの利用を推奨します

3. 有効期限
   - 証明書の有効期限を適切に設定し、期限切れ前に更新してください
   - 本番環境では90日以下の有効期限を推奨します

## ライセンス

MIT

## 注意事項

- このアプリケーションで生成される証明書は自己署名証明書です
- 本番環境での使用には適切な認証局（CA）から発行された証明書を使用してください
- 生成された証明書はブラウザに警告が表示される場合があります 