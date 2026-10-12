/**
 * Credenciais locais de demonstração. Os hashes/sais podem ser inspecionados
 * no bundle; para produção, mova a autenticação para um backend.
 * Os dois administradores possuem o mesmo papel e nível de acesso.
 */
export const ADMIN_CREDENTIALS = [
  {
    username: 'admin.eden',
    role: 'admin' as const,
    salt: 'c181c3219340810c3e51d05c2c16d1e1',
    passwordHash: '3cbe39893db2f9ccd2339da1883166c1ad19489603fa35d8737287a3c7d86049',
  },
  {
    username: 'admin.nexo',
    role: 'admin' as const,
    salt: 'f665f8c93e6c623209294aa43b7e5e4a',
    passwordHash: 'eb77e214541a95cd93cd171b576869bd0e62a4e62e13eadbd82dfbab32fd39ea',
  },
] as const;
