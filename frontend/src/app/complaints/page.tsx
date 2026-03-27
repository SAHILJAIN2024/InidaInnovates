import ComplaintForm from "../../components/ComplaintForm";
import ComplaintList from "../../components/ComplaintList";

export default function ComplaintsPage() {
  return (
    <div className="p-10 text-white">
      <h1 className="text-3xl font-bold mb-6">Complaint Management</h1>

      <ComplaintForm />
      <ComplaintList />
    </div>
  );
}