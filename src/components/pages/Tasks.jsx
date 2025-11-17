import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { isThisWeek, isToday, isTomorrow, parseISO } from "date-fns";
import { taskService } from "@/services/api/taskService";
import { contactService } from "@/services/api/contactService";
import { activityService } from "@/services/api/activityService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import SearchBar from "@/components/molecules/SearchBar";
import TaskItem from "@/components/molecules/TaskItem";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import TaskModal from "@/components/organisms/TaskModal";
import Button from "@/components/atoms/Button";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const filters = [
    { id: "all", name: "All Tasks", icon: "List" },
    { id: "today", name: "Due Today", icon: "Calendar" },
    { id: "overdue", name: "Overdue", icon: "AlertCircle" },
    { id: "completed", name: "Completed", icon: "CheckSquare" },
    { id: "pending", name: "Pending", icon: "Clock" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, filter]);

  const loadData = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const [tasksData, contactsData] = await Promise.all([
        taskService.getAll(),
        contactService.getAll(),
      ]);
      
      setTasks(tasksData);
      setContacts(contactsData);
    } catch (err) {
      setError("Failed to load tasks");
      console.error("Tasks error:", err);
    } finally {
      setIsLoading(false);
    }
};

  const filterTasks = () => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(task => {
        const taskTitle = task.title_c || task.title;
        const contact = getContactById(task.contactId_c || task.contactId);
        const contactName = contact && (contact.name_c || contact.name);
        return (
          taskTitle.toLowerCase().includes(searchLower) ||
          (contactName && contactName.toLowerCase().includes(searchLower))
        );
      });
    }

    // Apply category filter
    if (filter !== "all") {
      const now = new Date();
      filtered = filtered.filter(task => {
        const dueDate = parseISO(task.dueDate_c || task.dueDate);
        const completed = task.completed_c !== undefined ? task.completed_c : task.completed;
        
        switch (filter) {
          case "today":
            return isToday(dueDate) && !completed;
          case "overdue":
            return dueDate < now && !completed;
          case "completed":
            return completed;
          case "pending":
            return !completed;
          default:
            return true;
        }
      });
    }

    // Sort tasks: overdue first, then by due date
    filtered.sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1; // Completed tasks last
      }
      const aDate = parseISO(a.dueDate_c || a.dueDate);
      const bDate = parseISO(b.dueDate_c || b.dueDate);
      const now = new Date();
      
      const aCompleted = a.completed_c !== undefined ? a.completed_c : a.completed;
      const bCompleted = b.completed_c !== undefined ? b.completed_c : b.completed;
      
      const aOverdue = aDate < now && !aCompleted;
      const bOverdue = bDate < now && !bCompleted;
      
      if (aOverdue !== bOverdue) {
        return aOverdue ? -1 : 1; // Overdue tasks first
      }
      
      return aDate - bDate; // Then by due date
    });
    setFilteredTasks(filtered);
  };

  const getContactById = (contactId) => {
    return contacts.find(contact => contact.Id === contactId);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleAddTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };
const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }
    try {
      const task = tasks.find(t => t.Id === taskId);
      if (!task) {
        toast.error("Task not found");
        return;
      }
      
      await taskService.delete(taskId);
      const taskTitle = task.title_c || task.title;
      const contactId = task.contactId_c || task.contactId;
      await activityService.create({
        contactId_c: contactId,
        dealId_c: null,
        type_c: "task",
        description_c: `Task deleted: ${taskTitle}`,
        timestamp_c: new Date().toISOString(),
      });
      
      setTasks(prev => prev.filter(task => task.Id !== taskId));
      toast.success("Task deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete task");
      console.error("Delete task error:", error);
    }
  };
const handleToggleComplete = async (taskId) => {
    const task = tasks.find(t => t.Id === taskId);
    if (!task) return;

    try {
      const isCompleted = task.completed_c !== undefined ? task.completed_c : task.completed;
      const updatedCompleted = !isCompleted;
      const taskTitle = task.title_c || task.title;
      const contactId = task.contactId_c || task.contactId;
      
      await taskService.update(taskId, { completed_c: updatedCompleted });
      await activityService.create({
        contactId_c: contactId,
        dealId_c: null,
        type_c: "task",
        description_c: `Task ${updatedCompleted ? 'completed' : 'reopened'}: ${taskTitle}`,
        timestamp_c: new Date().toISOString(),
      });
      
      setTasks(prev =>
        prev.map(t =>
          t.Id === taskId
            ? { ...t, completed_c: updatedCompleted, updatedAt: new Date().toISOString() }
            : t
        )
      );
      
      toast.success(
        updatedCompleted 
          ? "Task marked as completed!" 
          : "Task reopened!"
      );
    } catch (error) {
      toast.error("Failed to update task");
      console.error("Toggle task error:", error);
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      if (selectedTask) {
        const updatePayload = {
          title_c: taskData.title,
          dueDate_c: taskData.dueDate,
          contactId_c: parseInt(taskData.contactId),
          completed_c: taskData.completed
        };
        await taskService.update(selectedTask.Id, updatePayload);
        await activityService.create({
          contactId_c: parseInt(taskData.contactId),
          dealId_c: null,
          type_c: "task",
          description_c: `Task updated: ${taskData.title}`,
          timestamp_c: new Date().toISOString(),
        });
        
        setTasks(prev =>
          prev.map(task =>
            task.Id === selectedTask.Id
              ? { 
                  ...task, 
                  title_c: taskData.title, 
                  dueDate_c: taskData.dueDate,
                  contactId_c: parseInt(taskData.contactId), 
                  updatedAt: new Date().toISOString() 
                }
              : task
          )
        );
      } else {
        const createPayload = {
          title_c: taskData.title,
          dueDate_c: taskData.dueDate,
          contactId_c: parseInt(taskData.contactId),
          completed_c: false,
        };
        const newTask = await taskService.create(createPayload);
        await activityService.create({
          contactId_c: parseInt(taskData.contactId),
          dealId_c: null,
          type_c: "task",
          description_c: `New task created: ${taskData.title}`,
          timestamp_c: new Date().toISOString(),
        });
        
        setTasks(prev => [...prev, newTask]);
      }
      
      setIsModalOpen(false);
      toast.success(
        selectedTask 
          ? "Task updated successfully!" 
          : "Task added successfully!"
      );
} catch (error) {
      toast.error("Failed to save task");
      console.error("Save task error:", error);
    }
  };

  const getTaskStats = () => {
    const now = new Date();
    const overdue = tasks.filter(task => {
      const completed = task.completed_c !== undefined ? task.completed_c : task.completed;
      const dueDate = parseISO(task.dueDate_c || task.dueDate);
      return !completed && dueDate < now;
    }).length;
    const today = tasks.filter(task => {
      const completed = task.completed_c !== undefined ? task.completed_c : task.completed;
      const dueDate = parseISO(task.dueDate_c || task.dueDate);
      return !completed && isToday(dueDate);
    }).length;
    const completed = tasks.filter(task => {
      return task.completed_c !== undefined ? task.completed_c : task.completed;
    }).length;
    const pending = tasks.filter(task => {
      const isCompleted = task.completed_c !== undefined ? task.completed_c : task.completed;
      return !isCompleted;
    }).length;

    return { overdue, today, completed, pending };
  };

  const stats = getTaskStats();

  if (isLoading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
            Tasks
          </h1>
          <p className="text-gray-600">
            Manage your follow-ups and stay on top of your customer relationships.
          </p>
        </div>
        
        <Button
          onClick={handleAddTask}
          className="flex items-center space-x-2 self-start sm:self-center"
        >
          <ApperIcon name="Plus" className="h-5 w-5" />
          <span>Add Task</span>
        </Button>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-lg bg-red-50 border border-red-200"
        >
          <div className="flex items-center space-x-3">
            <ApperIcon name="AlertCircle" className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              <p className="text-sm text-red-600">Overdue</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-lg bg-orange-50 border border-orange-200"
        >
          <div className="flex items-center space-x-3">
            <ApperIcon name="Calendar" className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats.today}</p>
              <p className="text-sm text-orange-600">Due Today</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-lg bg-blue-50 border border-blue-200"
        >
          <div className="flex items-center space-x-3">
            <ApperIcon name="Clock" className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.pending}</p>
              <p className="text-sm text-blue-600">Pending</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="p-4 rounded-lg bg-green-50 border border-green-200"
        >
          <div className="flex items-center space-x-3">
            <ApperIcon name="CheckSquare" className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              <p className="text-sm text-green-600">Completed</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex flex-wrap gap-2">
          {filters.map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === filterOption.id
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <ApperIcon name={filterOption.icon} className="h-4 w-4" />
              <span>{filterOption.name}</span>
            </button>
          ))}
        </div>
        
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search tasks or contacts..."
          className="sm:max-w-sm"
        />
      </div>

      {/* Results Info */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredTasks.length} of {tasks.length} tasks
          {filter !== "all" && ` in ${filters.find(f => f.id === filter)?.name.toLowerCase()}`}
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
      </div>

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <AnimatePresence>
            {filteredTasks.map((task) => {
              const contact = getContactById(task.contactId);
              
              return (
                <TaskItem
                  key={task.Id}
                  task={task}
                  contact={contact}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleEditTask}
                  onDelete={handleDeleteTask}
                />
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <Empty
          icon="CheckSquare"
          title={searchTerm || filter !== "all" ? "No tasks found" : "No tasks yet"}
          description={
            searchTerm || filter !== "all"
              ? "No tasks match your current filters. Try adjusting your search or filter."
              : "Create your first task to start managing follow-ups"
          }
          actionText="Add Task"
          onAction={handleAddTask}
        />
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export default Tasks;