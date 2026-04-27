import React, { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { CollaborationRequest, CollaborationStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getDealsApi, updateCollaborationStatusApi } from '../../services/collaborationService';

export const DealsPage: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [deals, setDeals] = useState<CollaborationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const statuses = ['accepted', 'in_progress', 'closed'];

  useEffect(() => {
    const loadDeals = async () => {
      try {
        const response = await getDealsApi();
        setDeals(response.deals);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadDeals();
  }, []);

  const toggleStatus = (status: string) => {
    setSelectedStatus((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'in_progress':
        return 'primary';
      case 'closed':
        return 'secondary';
      default:
        return 'gray';
    }
  };

  const getParty = (deal: CollaborationRequest) => {
    return user?.role === 'investor' ? deal.entrepreneur : deal.investor;
  };

  const filteredDeals = deals.filter((deal) => {
    const party = getParty(deal);

    const matchesSearch =
      searchQuery === '' ||
      party?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      party?.startupName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      party?.industry?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatus.length === 0 || selectedStatus.includes(deal.status);

    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (dealId: string, status: CollaborationStatus) => {
    const response = await updateCollaborationStatusApi(dealId, status);
    setDeals((prev) =>
      prev.map((item) => (item.id === dealId ? response.request : item))
    );
  };

  const activeDeals = deals.filter((deal) => deal.status === 'in_progress').length;
  const closedDeals = deals.filter((deal) => deal.status === 'closed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-600">Track collaboration and investment progress</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody>
            <p className="text-sm text-gray-600">Accepted Deals</p>
            <p className="text-lg font-semibold text-gray-900">
              {deals.filter((deal) => deal.status === 'accepted').length}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600">In Progress</p>
            <p className="text-lg font-semibold text-gray-900">{activeDeals}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm text-gray-600">Closed</p>
            <p className="text-lg font-semibold text-gray-900">{closedDeals}</p>
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-2/3">
          <Input
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            startAdornment={<Search size={18} />}
            fullWidth
          />
        </div>

        <div className="w-full md:w-1/3">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <Badge
                  key={status}
                  variant={selectedStatus.includes(status) ? getStatusColor(status) : 'gray'}
                  className="cursor-pointer"
                  onClick={() => toggleStatus(status)}
                >
                  {status.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-medium text-gray-900">
            {loading ? 'Loading deals...' : 'Active Deals'}
          </h2>
        </CardHeader>
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Party</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDeals.map((deal) => {
                  const party = getParty(deal);

                  return (
                    <tr key={deal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar
  src={party?.avatarUrl || ''}
  alt={party?.name || 'User'}
  size="sm"
  className="flex-shrink-0"
/>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {party?.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {party?.startupName || party?.industry || party?.bio}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                        {party?.role}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusColor(deal.status)}>
                          {deal.status.replace('_', ' ')}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(deal.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {deal.status === 'accepted' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatus(deal.id, 'in_progress')}
                          >
                            Mark In Progress
                          </Button>
                        )}

                        {deal.status === 'in_progress' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateStatus(deal.id, 'closed')}
                          >
                            Close Deal
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!loading && filteredDeals.length === 0 && (
              <div className="text-center py-8 text-gray-600">
                No deals found.
              </div>
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
