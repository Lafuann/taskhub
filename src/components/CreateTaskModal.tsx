import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { IoClose } from "react-icons/io5";

interface CreateTaskModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSave: (task: {
    title: string;
    status: string;
    description: string;
    priority: string;
    deadline: Date | null;
  }) => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  isSubmitting,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<{
    title: string;
    status: string;
    description: string;
    priority: string;
    deadline: Date | null;
  }>({
    title: "",
    status: "",
    description: "",
    priority: "",
    deadline: null,
  });

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: "",
        description: "",
        status: "",
        priority: "",
        deadline: null,
      });
    }
  }, [isOpen]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[calc(100dvh-80px)] mx-4 p-6 flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <IoClose size={32} className="hover:text-black/50" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-foreground text-center mb-6">
          Create New Task
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="overflow-y-auto px-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label htmlFor="title" className="form-label">
                  Title
                </label>
                <input
                  disabled={isSubmitting}
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Title"
                  required
                />
              </div>

              <div>
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <select
                  disabled={isSubmitting}
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="done">Done</option>
                  <option value="todo">Todo</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="form-label">
                  Priority
                </label>
                <select
                  disabled={isSubmitting}
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label htmlFor="deadline" className="form-label">
                  Deadline
                </label>
                {/* <input
                  disabled={isSubmitting}
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className="input-field"
                  required
                  /> */}
                <DatePicker
                  selected={formData.deadline}
                  onChange={(date) =>
                    setFormData({ ...formData, deadline: date })
                  }
                  minDate={new Date()}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="dd/mm/yyyy"
                  className="input-field min-w-32"
                  required
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  disabled={isSubmitting}
                  id="description"
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field resize-y max-h-36"
                  placeholder="Description"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mr-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#0cc0df] px-8 py-2 rounded-xl text-white hover:opacity-90"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
