import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Register = ({ switchToLogin }) => {
    const [nome, setNome] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmSenha, setConfirmSenha] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (senha !== confirmSenha) {
            setError('As senhas não coincidem');
            return;
        }

        if (senha.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const result = await register(nome, senha);
            if (result.success) {
                setSuccess('Conta criada com sucesso! Faça login.');
                setNome('');
                setSenha('');
                setConfirmSenha('');
                setTimeout(() => switchToLogin(), 2000);
            } else {
                setError(result.error);
            }
        } catch (error) {
            setError('Erro inesperado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>DebugWatch - Registro</h2>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="nome">Nome de usuário:</label>
                        <input
                            type="text"
                            id="nome"
                            value={nome}
                            onChange={(e) => setNome(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="senha">Senha:</label>
                        <input
                            type="password"
                            id="senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            required
                            disabled={loading}
                            minLength={6}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmSenha">Confirmar senha:</label>
                        <input
                            type="password"
                            id="confirmSenha"
                            value={confirmSenha}
                            onChange={(e) => setConfirmSenha(e.target.value)}
                            required
                            disabled={loading}
                            minLength={6}
                        />
                    </div>

                    <button type="submit" disabled={loading} className="btn-primary">
                        {loading ? 'Criando conta...' : 'Criar conta'}
                    </button>
                </form>

                <p className="switch-auth">
                    Já tem conta?{' '}
                    <button onClick={switchToLogin} className="btn-link">
                        Faça login
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Register;