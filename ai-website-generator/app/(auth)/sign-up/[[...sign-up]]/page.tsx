import { SignUp } from '@clerk/nextjs'

export default function Page() {
    return (
        <div className='flex flex-col justify-center items-center h-screen bg-gradient-to-b from-blue-50 to-white'>
            <div className="mb-8 text-center">
                <h1 className="text-2xl font-bold mb-2">Sign Up for Ai website generator</h1>
                <p className="text-gray-600">Create an account to start designing</p>
            </div>
            <SignUp appearance={{
                elements: {
                    logoBox: "hidden",
                    headerTitle: "hidden",
                    headerSubtitle: "hidden",
                    card: "shadow-none border-none",
                }
            }} />
        </div>
    );
}