import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { contactService } from "@/services/api/contactService";
import { dealService } from "@/services/api/dealService";
import { taskService } from "@/services/api/taskService";
import { activityService } from "@/services/api/activityService";
import { alertService } from "@/services/api/alertService";
import ContactModal from "@/components/organisms/ContactModal";
import TaskModal from "@/components/organisms/TaskModal";
import DealModal from "@/components/organisms/DealModal";
import Header from "@/components/organisms/Header";
const Layout = () => {
  const [modals, setModals] = useState({
    contact: { isOpen: false, data: null },
    deal: { isOpen: false, data: null },
    task: { isOpen: false, data: null },
  });

  const openModal = (type, data = null) => {
    setModals(prev => ({
      ...prev,
      [type]: { isOpen: true, data }
    }));
  };

  const closeModal = (type) => {
    setModals(prev => ({
      ...prev,
      [type]: { isOpen: false, data: null }
    }));
  };

  const handleSaveContact = async (contactData) => {
    const contact = modals.contact.data;
    
if (contact) {
      const updatePayload = {
        name_c: contactData.name,
        company_c: contactData.company,
        email_c: contactData.email,
        phone_c: contactData.phone,
        tags_c: contactData.tags,
        notes_c: contactData.notes
      };
      await contactService.update(contact.Id, updatePayload);
      await activityService.create({
        contactId_c: contact.Id,
        dealId_c: null,
        type_c: "note",
        description_c: `Contact updated: ${contactData.name}`,
        timestamp_c: new Date().toISOString(),
      });
    } else {
      const createPayload = {
        name_c: contactData.name,
        company_c: contactData.company,
        email_c: contactData.email,
        phone_c: contactData.phone,
        tags_c: contactData.tags,
        notes_c: contactData.notes
      };
      const newContact = await contactService.create(createPayload);
const newContact = await contactService.create(createPayload);
      await activityService.create({
        contactId_c: newContact.Id,
        dealId_c: null,
        type_c: "note",
        description_c: `New contact added: ${contactData.name}`,
        timestamp_c: new Date().toISOString(),
      });
  };

  const handleSaveDeal = async (dealData) => {
    const deal = modals.deal.data;
    
if (deal) {
      const updatePayload = {
        title_c: dealData.title,
        value_c: dealData.value,
        stage_c: dealData.stage,
        probability_c: dealData.probability,
        expectedCloseDate_c: dealData.expectedCloseDate,
        contactId_c: parseInt(dealData.contactId)
      };
      await dealService.update(deal.Id, updatePayload);
      await activityService.create({
        contactId_c: parseInt(dealData.contactId),
        dealId_c: deal.Id,
        type_c: "deal",
        description_c: `Deal updated: ${dealData.title} - $${dealData.value}`,
        timestamp_c: new Date().toISOString(),
      });
    } else {
      const createPayload = {
        title_c: dealData.title,
        value_c: dealData.value,
        stage_c: dealData.stage,
        probability_c: dealData.probability,
        expectedCloseDate_c: dealData.expectedCloseDate,
        contactId_c: parseInt(dealData.contactId)
      };
      const newDeal = await dealService.create(createPayload);
      await activityService.create({
        contactId_c: parseInt(dealData.contactId),
        dealId_c: newDeal.Id,
        type_c: "deal",
        description_c: `New deal created: ${dealData.title} - $${dealData.value}`,
        timestamp_c: new Date().toISOString(),
      });
    }
  };

  const handleSaveTask = async (taskData) => {
    const task = modals.task.data;
    
if (task) {
      const updatePayload = {
        title_c: taskData.title,
        dueDate_c: taskData.dueDate,
        contactId_c: parseInt(taskData.contactId),
        completed_c: taskData.completed
      };
      await taskService.update(task.Id, updatePayload);
      await activityService.create({
        contactId_c: parseInt(taskData.contactId),
        dealId_c: null,
        type_c: "task",
        description_c: `Task updated: ${taskData.title}`,
        timestamp_c: new Date().toISOString(),
      });
    } else {
      const createPayload = {
        title_c: taskData.title,
        dueDate_c: taskData.dueDate,
        contactId_c: parseInt(taskData.contactId),
        completed_c: false
      };
      const newTask = await taskService.create(createPayload);
      await activityService.create({
        contactId_c: parseInt(taskData.contactId),
        dealId_c: null,
        type_c: "task",
        description_c: `New task created: ${taskData.title}`,
        timestamp_c: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        onAddContact={() => openModal("contact")}
        onAddDeal={() => openModal("deal")}
        onAddTask={() => openModal("task")}
      />
      
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Modals */}
      <ContactModal
        isOpen={modals.contact.isOpen}
        onClose={() => closeModal("contact")}
        contact={modals.contact.data}
        onSave={handleSaveContact}
      />

      <DealModal
        isOpen={modals.deal.isOpen}
        onClose={() => closeModal("deal")}
        deal={modals.deal.data}
        onSave={handleSaveDeal}
      />

      <TaskModal
        isOpen={modals.task.isOpen}
        onClose={() => closeModal("task")}
        task={modals.task.data}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export default Layout;