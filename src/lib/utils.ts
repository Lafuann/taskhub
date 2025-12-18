import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import Swal from "sweetalert2";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const swal = Swal.mixin({
  confirmButtonColor: "#2563eb", // biru (Tailwind blue-600)
  cancelButtonColor: "#dc2626", // merah
});

export default swal;
