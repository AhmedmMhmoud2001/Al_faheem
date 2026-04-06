import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, setTokens } from '../api/client.js';
import Button from '../components/ui/Button.jsx';
import { Card, CardBody } from '../components/ui/Card.jsx';
import Input from '../components/ui/Input.jsx';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@al-faheem.local');
  const [password, setPassword] = useState('Admin123456');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (!['ADMIN', 'STAFF'].includes(data.user.role)) {
        setErr(t('errors.notAdmin'));
        return;
      }
      setTokens(data.accessToken, data.refreshToken);
      navigate('/');
    } catch (ex) {
      setErr(ex.response?.data?.message || t('errors.loginFailed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--app-bg)] p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardBody className="space-y-4 p-8">
          <h1 className="text-2xl font-black text-[var(--app-fg)]">{t('login.title')}</h1>
          {err && <p className="text-sm font-bold text-red-600 dark:text-red-400">{err}</p>}
          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label={t('login.email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label={t('login.password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading} size="lg" className="w-full">
              {loading ? t('login.loading') : t('login.submit')}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
