import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { dealService } from "@/services/api/dealService";
import { contactService } from "@/services/api/contactService";
import { activityService } from "@/services/api/activityService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import DealCard from "@/components/molecules/DealCard";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import DealModal from "@/components/organisms/DealModal";
import Button from "@/components/atoms/Button";

const Pipeline = () => {
  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedDeal, setDraggedDeal] = useState(null);

  const stages = [
    { id: "Lead", name: "Lead", color: "bg-blue-50 border-blue-200" },
    { id: "Qualified", name: "Qualified", color: "bg-indigo-50 border-indigo-200" },
    { id: "Proposal", name: "Proposal", color: "bg-purple-50 border-purple-200" },
    { id: "Negotiation", name: "Negotiation", color: "bg-orange-50 border-orange-200" },
    { id: "Won", name: "Won", color: "bg-green-50 border-green-200" },
    { id: "Lost", name: "Lost", color: "bg-red-50 border-red-200" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setError("");
    
    try {
      const [dealsData, contactsData] = await Promise.all([
        dealService.getAll(),
        contactService.getAll(),
      ]);
      
      setDeals(dealsData);
      setContacts(contactsData);
    } catch (err) {
      setError("Failed to load pipeline data");
      console.error("Pipeline error:", err);
    } finally {
      setIsLoading(false);
    }
  };

const getDealsByStage = (stage) => {
    return deals.filter(deal => {
      const dealStage = deal.stage_c || deal.stage;
      return dealStage === stage;
    });
  };

  const getContactById = (contactId) => {
    if (!contactId) return null;
    return contacts.find(contact => contact.Id === contactId);
  };

  const getStageTotal = (stage) => {
    const stageDeals = getDealsByStage(stage);
    return stageDeals.reduce((sum, deal) => sum + (deal.value_c || deal.value || 0), 0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleAddDeal = () => {
    setSelectedDeal(null);
    setIsModalOpen(true);
  };

  const handleEditDeal = (deal) => {
    setSelectedDeal(deal);
    setIsModalOpen(true);
  };

  const handleSaveDeal = async (dealData) => {
    try {
      if (selectedDeal) {
const updatePayload = {
          title_c: dealData.title,
          value_c: dealData.value,
          stage_c: dealData.stage,
          probability_c: dealData.probability,
          expectedCloseDate_c: dealData.expectedCloseDate,
          contactId_c: parseInt(dealData.contactId)
        };
        await dealService.update(selectedDeal.Id, updatePayload);
        await activityService.create({
          contactId_c: parseInt(dealData.contactId),
          dealId_c: selectedDeal.Id,
          type_c: "deal",
          description_c: `Deal updated: ${dealData.title} - $${dealData.value}`,
          timestamp_c: new Date().toISOString(),
        });
        
        setDeals(prev =>
          prev.map(deal =>
            deal.Id === selectedDeal.Id
              ? { ...deal, ...updatePayload, updatedAt: new Date().toISOString() }
              : deal
          )
        );
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
        
        setDeals(prev => [...prev, newDeal]);
      }
      
      setIsModalOpen(false);
      toast.success(
        selectedDeal 
          ? "Deal updated successfully!" 
          : "Deal added successfully!"
      );
    } catch (error) {
      toast.error("Failed to save deal");
      console.error("Save deal error:", error);
    }
  };

  const handleDragStart = (deal) => {
    setDraggedDeal(deal);
  };

  const handleDragEnd = () => {
    setDraggedDeal(null);
  };

const handleStageDrop = async (targetStage) => {
    const currentStage = draggedDeal?.stage_c || draggedDeal?.stage;
    if (!draggedDeal || currentStage === targetStage) return;

    try {
      const contactId = draggedDeal.contactId_c || draggedDeal.contactId;
      const dealTitle = draggedDeal.title_c || draggedDeal.title;
      
      await dealService.update(draggedDeal.Id, { stage_c: targetStage });
      await activityService.create({
        contactId_c: contactId,
        dealId_c: draggedDeal.Id,
        type_c: "deal",
        description_c: `Deal moved to ${targetStage}: ${dealTitle}`,
        timestamp_c: new Date().toISOString(),
      });
      
      setDeals(prev =>
        prev.map(deal =>
          deal.Id === draggedDeal.Id
            ? { ...deal, stage_c: targetStage, updatedAt: new Date().toISOString() }
            : deal
        )
      );
      
      toast.success(`Deal moved to ${targetStage}!`);
    } catch (error) {
      toast.error("Failed to update deal stage");
      console.error("Update deal stage error:", error);
    }
    
    setDraggedDeal(null);
  };

  if (isLoading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
            Sales Pipeline
          </h1>
          <p className="text-gray-600">
            Track your deals through each stage of your sales process.
          </p>
        </div>
        
        <Button
          onClick={handleAddDeal}
          className="flex items-center space-x-2 self-start sm:self-center"
        >
          <ApperIcon name="Plus" className="h-5 w-5" />
          <span>Add Deal</span>
        </Button>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        {stages.map((stage) => {
          const stageDeals = getDealsByStage(stage.id);
          const stageTotal = getStageTotal(stage.id);
          
          return (
            <motion.div
              key={stage.id}
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-lg border-2 ${stage.color} transition-all duration-200`}
            >
              <div className="text-center">
                <h3 className="font-medium text-gray-900 text-sm mb-1">
                  {stage.name}
                </h3>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {stageDeals.length}
                </p>
                <p className="text-xs text-gray-600">
                  {formatCurrency(stageTotal)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Pipeline Board */}
      {deals.length > 0 ? (
        <div className="overflow-x-auto">
          <div className="flex space-x-6 pb-6" style={{ minWidth: "1200px" }}>
            {stages.map((stage) => {
              const stageDeals = getDealsByStage(stage.id);
              
              return (
                <div
                  key={stage.id}
                  className="flex-1 min-w-[300px]"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleStageDrop(stage.id)}
                >
                  <div className={`rounded-lg border-2 ${stage.color} p-4 min-h-[600px]`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">
                        {stage.name}
                      </h3>
                      <div className="text-sm text-gray-600">
                        {formatCurrency(getStageTotal(stage.id))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <AnimatePresence>
                        {stageDeals.map((deal) => {
                          const contact = getContactById(deal.contactId);
                          
                          return (
                            <motion.div
                              key={deal.Id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              layout
                            >
                              <DealCard
                                deal={deal}
                                contact={contact}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                              />
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                      
                      {stageDeals.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <ApperIcon name="Package" className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No deals in {stage.name.toLowerCase()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <Empty
          icon="GitBranch"
          title="No deals in your pipeline"
          description="Add your first deal to start tracking your sales progress"
          actionText="Add Deal"
          onAction={handleAddDeal}
        />
      )}

      {/* Deal Modal */}
      <DealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        deal={selectedDeal}
        onSave={handleSaveDeal}
      />
    </div>
  );
};

export default Pipeline;