import { SignIn } from '@clerk/clerk-react'

function Home() {
  return (
    <div className="h-screen flex justify-center items-center">
      <SignIn afterSignInUrl="/admin" />
    </div>
  )
}

export default Home