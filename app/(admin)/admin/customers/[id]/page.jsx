import UserProfileClient from "./UserProfileClient";

export const metadata = {
  title: "User Profile Management - Raven Fragrance Admin",
};

export default async function UserProfilePage({ params }) {
  const { id } = await params; // required await fix
  return <UserProfileClient userId={id} />;
}
