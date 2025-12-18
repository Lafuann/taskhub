import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CreateTaskModal from "../components/CreateTaskModal";
import { IoChevronDown, IoPersonCircle } from "react-icons/io5";
import {
  // FaEdit,
  FaPlusCircle,
  FaSearch,
  FaTrash,
} from "react-icons/fa";
import { taskService } from "../lib/services";
import swal from "../lib/utils";
import moment from "moment";
import DatePicker from "react-datepicker";
import api from "../lib/axios";
import { BadgeButton } from "../components/ui/badge-button";

interface Task {
  id: number;
  title: string;
  description: string;
  is_completed: number;
  priority: string;
  deadline_date: string;
  needs_attention: boolean;
}

interface Filters {
  status?: string;
  priority?: string;
  deadline_start?: Date | null;
  deadline_end?: Date | null;
  sort_deadline?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userName, setUserName] = useState("Username");
  const [isFeching, setIsFetching] = useState(false);
  const [allowGet, setAllowGet] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reminderTasks, setReminderTasks] = useState<Task[]>([]);
  const [changeStatus, setChangeStatus] = useState<{
    id: number | null;
    status: boolean;
  }>({ id: null, status: false });

  const dropdownRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState<Filters>({
    status: "",
    priority: "",
    deadline_start: null,
    deadline_end: null,
    sort_deadline: "",
  });

  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsed = JSON.parse(user);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserName(parsed.name || "Username");
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchTasks = async (): Promise<void> => {
      setIsFetching(true);
      try {
        const rsp = await taskService.getTasks({});

        if (isMounted) {
          setTasks(rsp.data.data);
          setIsFetching(false);
          setAllowGet(false);
        }
      } catch {
        if (isMounted) {
          setAllowGet(false);
          swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch tasks. Please try again.",
          });
        }
      }
    };
    if (allowGet) fetchTasks();

    return () => {
      isMounted = false;
    };
  }, [allowGet]);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const rsp = await api.get("/tasks/reminder");
        setReminderTasks(rsp.data.data);

        if (rsp.data.data.length > 0) {
          swal.fire({
            icon: "warning",
            title: "Reminder",
            text: `You have ${rsp.data.data.length} task(s) due within 1 day`,
          });
        }
      } catch (error) {
        console.error("Failed to fetch reminders", error);
      }
    };

    fetchReminders();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateTask = async (task: {
    title: string;
    description: string;
    status: string;
    priority: string;
    deadline: Date | null;
  }) => {
    const newTask = {
      id: tasks.length + 1,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      deadline: task.deadline ? task.deadline.toLocaleDateString("en-GB") : "",
    };
    try {
      setIsSubmitting(true);
      const rsp = await taskService.createTask(newTask);
      if (rsp.data.success) {
        const result = await swal.fire(
          "Success",
          "Task has been created.",
          "success"
        );
        if (result.isConfirmed) {
          setIsSubmitting(false);
          setIsModalOpen(false);
          setAllowGet(true);
        }
      }
    } catch (error) {
      setIsSubmitting(false);
      swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed creating task. Please try again. ${error}`,
      });
    }
  };

  const handleCompleteTask = async (id: number) => {
    setChangeStatus({ id, status: true });
    try {
      const rsp = await taskService.completeTask(id);
      if (rsp.data.success) {
        const result = await swal.fire(
          "Success",
          `Task has been updated.`,
          "success"
        );
        if (result.isConfirmed) {
          setChangeStatus({ id: null, status: false });
          setAllowGet(true);
        }
      }
    } catch (error) {
      setChangeStatus({ id: null, status: false });
      swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed completing task. Please try again. ${error}`,
      });
    }
  };

  const handleSearch = async () => {
    setIsFetching(true);
    try {
      const body = {
        ...filters,
        priority: filters.priority?.toLowerCase() || undefined,
        deadline_from: filters.deadline_start
          ? moment(filters.deadline_start).format("YYYY-MM-DD")
          : undefined,
        deadline_to: filters.deadline_end
          ? moment(filters.deadline_end).format("YYYY-MM-DD")
          : undefined,
        sort: filters.sort_deadline ? "deadline" : undefined,
        order: filters.sort_deadline || undefined,
      };
      const rsp = await taskService.getTasks(body);
      setTasks(rsp.data.data);
      setIsFetching(false);
    } catch {
      swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch tasks. Please try again.",
      });
    }
  };

  const handleDeleteTask = async (id: number) => {
    const result = await swal.fire({
      title: "Are you sure?",
      text: "Taks will be deteted permanently!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const rsp = await taskService.deleteTask(id);
        if (rsp.data.success) {
          swal.fire("Success", "Task has been deleted.", "success");
          setAllowGet(true);
        }
      } catch (error) {
        swal.fire({
          icon: "error",
          title: "Error",
          text: `Failed deleting task. Please try again. ${error}`,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 flex justify-end bg-white items-center mb-6 h-16 px-12 shadow-[0px_6px_6px_0px_rgba(0,0,0,0.1)]">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 text-black hover:text-black/70"
          >
            <IoPersonCircle size={32} />
            <span className="font-medium">{userName}</span>
            <IoChevronDown size={20} />
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-[0px_-8px_18px_0px_rgba(0,0,0,0.1)] rounded-lg z-50 border-b">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-black hover:bg-black/10 flex items-center gap-2 rounded-lg"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Log out
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-6">
        <div className="mb-6 max-h-56 overflow-y-auto">
          <h3 className="sticky top-0 text-lg font-semibold text-red-600 w-full bg-white">
            🔔 Reminder Tasks
          </h3>

          {reminderTasks.map((task) => (
            <div
              key={task.id}
              className="flex justify-between items-center bg-red-50 border border-red-200 px-4 py-2 rounded-lg mb-2"
            >
              <div>
                <p className="font-medium">{task.title}</p>
                <p className="text-sm text-gray-600">
                  Deadline: {moment(task.deadline_date).format("DD/MM/YYYY")}
                </p>
              </div>

              {task.needs_attention && (
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs">
                  Needs Attention
                </span>
              )}
            </div>
          ))}
        </div>
        {/* Filters & Create Button */}
        <div className="flex justify-end">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#0cc0df] text-white px-4 py-2 rounded-xl hover:opacity-90 cursor-pointer"
          >
            <FaPlusCircle size={24} className="text-white" />
            Create Task
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="form-label">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="input-field min-w-35"
              >
                <option value="">All</option>
                <option value="done">Done</option>
                <option value="todo">Todo</option>
              </select>
            </div>

            <div>
              <label className="form-label">Priority</label>
              <select
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                className="input-field min-w-35"
              >
                <option value="">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="form-label">Deadline (Start)</label>
              <DatePicker
                selected={filters.deadline_start}
                onChange={(date) =>
                  setFilters({ ...filters, deadline_start: date })
                }
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                className="input-field min-w-32"
              />
            </div>

            <div>
              <label className="form-label">Deadline (end)</label>
              <DatePicker
                selected={filters.deadline_end}
                onChange={(date) =>
                  setFilters({ ...filters, deadline_end: date })
                }
                dateFormat="dd/MM/yyyy"
                placeholderText="dd/mm/yyyy"
                className="input-field min-w-32"
              />
            </div>

            <div>
              <label className="form-label">Sort Deadline</label>
              <select
                name="sort_deadline"
                value={filters.sort_deadline}
                onChange={handleFilterChange}
                className="input-field min-w-35"
              >
                <option value="">Default</option>
                <option value="asc">Closest deadline</option>
                <option value="desc">Latest deadline</option>
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 h-11 rounded-xl hover:opacity-90 cursor-pointer"
            >
              <FaSearch size={24} className="text-white" />
              Search
            </button>
            <button
              onClick={() => {
                setFilters({
                  status: "",
                  priority: "",
                  deadline_start: null,
                  deadline_end: null,
                  sort_deadline: "",
                });
                setAllowGet(true);
              }}
              className="flex items-center gap-2 border border-red-600 text-red-600 px-4 py-2 h-11 rounded-xl hover:opacity-90 cursor-pointer hover:bg-red-600 hover:text-white"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="bg-[#0cc0df] text-white">
                <th className="px-4 py-3 text-left font-medium w-12"></th>
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Description</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
                <th className="px-4 py-3 text-center font-medium">Priority</th>
                <th className="px-4 py-3 text-center font-medium">Deadline</th>
                <th className="px-4 py-3 text-center font-medium">Note</th>
                <th className="px-4 py-3 text-center font-medium w-24"></th>
              </tr>
            </thead>
            <tbody>
              {isFeching ? (
                <tr className="border-b border-border hover:bg-muted/50 text-center">
                  <td colSpan={7} className="text-center py-4">
                    Fetching tasks...
                  </td>
                </tr>
              ) : !tasks.length ? (
                <tr className="border-b border-border hover:bg-muted/50 text-center">
                  <td colSpan={7} className="text-center py-4">
                    Tasks is Empty.
                  </td>
                </tr>
              ) : (
                tasks.map((task, index) => (
                  <tr
                    key={task.id}
                    className={`hover:bg-muted/50 odd:bg-white even:bg-gray-200 ${
                      task.needs_attention ? "bg-red-50" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-gray-500">{index + 1}</td>
                    <td className="px-4 py-3 text-black">{task.title}</td>
                    <td className="px-4 py-3 text-black">{task.description}</td>
                    <td className="px-4 py-3 text-center text-black">
                      <BadgeButton
                        id={task.id}
                        label={task.is_completed ? "Done" : "Todo"}
                        variant={task.is_completed ? "success" : "warning"}
                        onClick={handleCompleteTask}
                        disabled={
                          changeStatus.id === task.id && changeStatus.status
                        }
                      />
                      {/* <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          task.is_completed === 1
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {task.is_completed === 1 ? "Done" : "Todo"}
                      </span> */}
                    </td>
                    <td className="px-4 py-3 text-center text-black">
                      <span
                        className={`ml-2 px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          task.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : task.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-black">
                      {moment(task.deadline_date).format("DD/MM/YYYY")}
                    </td>
                    <td className="px-4 py-3 text-center text-black">
                      {task.needs_attention && (
                        <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                          Needs Attention
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {/* <FaEdit
                          className="text-gray-600 hover:text-black cursor-pointer"
                          size={18}
                        /> */}
                        <FaTrash
                          onClick={() => handleDeleteTask(task.id)}
                          className="text-gray-600 hover:text-red-500 cursor-pointer"
                          size={18}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isModalOpen}
        isSubmitting={isSubmitting}
        onClose={() => setIsModalOpen(false)}
        onSave={handleCreateTask}
      />
    </div>
  );
};

export default Dashboard;
