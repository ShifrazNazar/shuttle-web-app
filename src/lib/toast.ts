import { toast } from "sonner";

// Simple toast messages
export const showToast = {
  success: (message: string) => {
    toast.success(message);
  },

  error: (message: string) => {
    toast.error(message);
  },

  loading: (message: string) => {
    return toast.loading(message);
  },

  dismiss: (toastId: string | number) => {
    toast.dismiss(toastId);
  },

  // User management toasts
  userCreated: (role: string) => {
    toast.success(`${role} created!`);
  },

  userUpdated: (role: string) => {
    toast.success(`${role} updated!`);
  },

  userDeleted: (role: string) => {
    toast.success(`${role} deleted!`);
  },

  passwordReset: () => {
    toast.success("Password reset!");
  },

  busAssigned: () => {
    toast.success("Bus assigned!");
  },

  // Error toasts
  createUserError: (error: string) => {
    toast.error(`Create failed: ${error}`);
  },

  updateUserError: (error: string) => {
    toast.error(`Update failed: ${error}`);
  },

  deleteUserError: (error: string) => {
    toast.error(`Delete failed: ${error}`);
  },

  passwordResetError: (error: string) => {
    toast.error(`Reset failed: ${error}`);
  },

  assignBusError: (error: string) => {
    toast.error(`Assignment failed: ${error}`);
  },
};
