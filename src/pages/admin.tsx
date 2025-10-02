import Admin from '@/components/admin'
import AdminQR from '@/components/admin-qr'
import { Layout } from '@/components/Layout'
import { useClerk } from "@clerk/clerk-react";


function admin() {
  const {user} = useClerk()
  console.log(user?.publicMetadata.plan)
  if (user?.publicMetadata.plan === 'standard'){
    return (
        <Layout>
          <AdminQR/>
        </Layout>
    )
  }else{
    return (
        <Layout>
          <Admin/>
        </Layout>
    )
  }
}

export default admin