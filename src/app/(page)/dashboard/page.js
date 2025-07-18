
import LogoutButton from "@/components/ButtonLogout";
import CreateUser from "@/components/CreateUser";
import PriceingDocumentCreator from "@/components/PriceingDocumentCreator";
import ProtectedRoute from "@/components/ProtectedRoute";
import SeactionsRadio from "@/components/SectionsRadio";
import UserList from "@/components/UserListConrtrol";

const Page = () => {
    return (
            <ProtectedRoute redirectTo="/auth-admin">
                <div className="bg-gray-100 min-h-screen max-h-full p-4 flex flex-col items-center justify-start">

                    <PriceingDocumentCreator/>
                    <SeactionsRadio />
                    <UserList/>
                    <CreateUser/>
                </div>
            </ProtectedRoute>
        
    );
}
export default Page;
