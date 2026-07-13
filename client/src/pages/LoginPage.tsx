import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, KeyRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { signIn, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const emailValue = watch('email');

  const onSubmit = async (data: LoginForm) => {
    setLoading(true);
    const result = await signIn(data.email, data.password);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Welcome back!');
    }
  };

  const handleForgotPassword = async () => {
    if (!emailValue) {
      toast.error('Enter your email first');
      return;
    }
    const result = await resetPassword(emailValue);
    if (result.error) {
      toast.error(result.error);
    } else {
      setResetSent(true);
      toast.success('Password reset email sent!');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft-xl p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Welcome back</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Sign in to manage attendance
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            leftIcon={<Mail size={18} />}
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Lock size={18} />}
            error={errors.password?.message}
            {...register('password')}
          />

          <Button
            type="submit"
            loading={loading}
            fullWidth
            icon={<ArrowRight size={18} />}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 space-y-3 text-center">
          {resetSent ? (
            <p className="text-sm text-success-600 font-medium">
              ✓ Check your email for the reset link
            </p>
          ) : (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
            >
              <KeyRound size={14} /> Forgot password?
            </button>
          )}
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
