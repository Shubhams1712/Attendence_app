import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['cr', 'teacher'], { required_error: 'Please select a role' }),
});

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'cr' },
  });

  const selectedRole = watch('role');

  const roleOptions = [
    { value: 'cr', label: 'Class Representative (CR)' },

    { value: 'teacher', label: 'Teacher' },
  ];

  const onSubmit = async (data: RegisterForm) => {
    setLoading(true);
    const result = await signUp(data.email, data.password, data.full_name, data.role);
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success('Account created! Please check your email to verify.');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft-xl p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Create Account</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Join your class attendance system
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="John Doe"
            leftIcon={<User size={18} />}
            error={errors.full_name?.message}
            {...register('full_name')}
          />

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

          <Select
            label="Role"
            value={selectedRole || ''}
            onChange={(val) => {}}
            options={roleOptions}
            error={errors.role?.message}
          />

          <Button
            type="submit"
            loading={loading}
            fullWidth
            icon={<ArrowRight size={18} />}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
