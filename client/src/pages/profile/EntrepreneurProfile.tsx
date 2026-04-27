import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, Users, Calendar, Building2, MapPin, UserCircle, Send } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { Entrepreneur } from '../../types';
import { getUserByIdApi } from '../../services/userService';
import { sendCollaborationRequestApi, getMyCollaborationRequestsApi } from '../../services/collaborationService';

export const EntrepreneurProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, updateProfile } = useAuth();

  const [entrepreneur, setEntrepreneur] = useState<Entrepreneur | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasRequestedCollaboration, setHasRequestedCollaboration] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatarUrl: '',
    location: '',
    startupName: '',
    pitchSummary: '',
    fundingNeeded: '',
    industry: '',
    foundedYear: '',
    teamSize: '',
    startupHistory: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) return;

      try {
        const response = await getUserByIdApi(id);
        const fetchedUser = response.user as Entrepreneur;
        setEntrepreneur(fetchedUser);

        setFormData({
          name: fetchedUser.name || '',
          bio: fetchedUser.bio || '',
          avatarUrl: fetchedUser.avatarUrl || '',
          location: fetchedUser.location || '',
          startupName: fetchedUser.startupName || '',
          pitchSummary: fetchedUser.pitchSummary || '',
          fundingNeeded: fetchedUser.fundingNeeded || '',
          industry: fetchedUser.industry || '',
          foundedYear: fetchedUser.foundedYear ? String(fetchedUser.foundedYear) : '',
          teamSize: fetchedUser.teamSize ? String(fetchedUser.teamSize) : '',
          startupHistory: fetchedUser.startupHistory || ''
        });

        if (currentUser?.role === 'investor') {
          const requestsResponse = await getMyCollaborationRequestsApi('outgoing');
          setHasRequestedCollaboration(
            requestsResponse.requests.some((req) => req.entrepreneurId === id)
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

    loadProfile();
  }, [id, currentUser]);

  if (!entrepreneur || entrepreneur.role !== 'entrepreneur') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Entrepreneur not found</h2>
        <p className="text-gray-600 mt-2">The entrepreneur profile you are looking for does not exist.</p>
        <Link to="/dashboard/investor">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const isCurrentUser = currentUser?.id === entrepreneur.id;
  const isInvestor = currentUser?.role === 'investor';

  const handleSendRequest = async () => {
    if (!isInvestor || !id) return;

    await sendCollaborationRequestApi(
      id,
      `I am interested in learning more about ${entrepreneur.startupName || entrepreneur.name} and exploring investment opportunities.`
    );

    setHasRequestedCollaboration(true);
  };

  const handleSave = async () => {
    await updateProfile({
      name: formData.name,
      bio: formData.bio,
      avatarUrl: formData.avatarUrl,
      location: formData.location,
      startupName: formData.startupName,
      pitchSummary: formData.pitchSummary,
      fundingNeeded: formData.fundingNeeded,
      industry: formData.industry,
      foundedYear: formData.foundedYear ? Number(formData.foundedYear) : null,
      teamSize: formData.teamSize ? Number(formData.teamSize) : 1,
      startupHistory: formData.startupHistory
    });

    setEntrepreneur((prev) =>
      prev
        ? {
            ...prev,
            ...formData,
            foundedYear: formData.foundedYear ? Number(formData.foundedYear) : null,
            teamSize: formData.teamSize ? Number(formData.teamSize) : 1
          }
        : prev
    );
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardBody className="sm:flex sm:items-start sm:justify-between p-6">
          <div className="sm:flex sm:space-x-6">
            <Avatar
              src={entrepreneur.avatarUrl}
              alt={entrepreneur.name}
              size="xl"
              className="mx-auto sm:mx-0"
            />

            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{entrepreneur.name}</h1>
              <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">
                <Building2 size={16} className="mr-1" />
                Founder at {entrepreneur.startupName || 'Startup not set'}
              </p>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                {entrepreneur.industry && <Badge variant="primary">{entrepreneur.industry}</Badge>}
                {entrepreneur.location && (
                  <Badge variant="gray">
                    <MapPin size={14} className="mr-1" />
                    {entrepreneur.location}
                  </Badge>
                )}
                {entrepreneur.foundedYear && (
                  <Badge variant="accent">
                    <Calendar size={14} className="mr-1" />
                    Founded {entrepreneur.foundedYear}
                  </Badge>
                )}
                <Badge variant="secondary">
                  <Users size={14} className="mr-1" />
                  {entrepreneur.teamSize || 1} team members
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
            {!isCurrentUser && (
              <>
                <Link to={`/chat/${entrepreneur.id}`}>
                  <Button variant="outline" leftIcon={<MessageCircle size={18} />}>
                    Message
                  </Button>
                </Link>

                {isInvestor && (
                  <Button
                    leftIcon={<Send size={18} />}
                    disabled={hasRequestedCollaboration}
                    onClick={handleSendRequest}
                  >
                    {hasRequestedCollaboration ? 'Request Sent' : 'Request Collaboration'}
                  </Button>
                )}
              </>
            )}

            {isCurrentUser && (
              <Button
                variant="outline"
                leftIcon={<UserCircle size={18} />}
                onClick={() => setIsEditing((prev) => !prev)}
              >
                {isEditing ? 'Cancel Edit' : 'Edit Profile'}
              </Button>
            )}
          </div>
        </CardBody>
      </Card>

      {isCurrentUser && isEditing && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Edit Profile</h2>
          </CardHeader>
          <CardBody className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Full Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth />
            <Input label="Avatar URL" value={formData.avatarUrl} onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })} fullWidth />
            <Input label="Location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} fullWidth />
            <Input label="Startup Name" value={formData.startupName} onChange={(e) => setFormData({ ...formData, startupName: e.target.value })} fullWidth />
            <Input label="Industry" value={formData.industry} onChange={(e) => setFormData({ ...formData, industry: e.target.value })} fullWidth />
            <Input label="Funding Needed" value={formData.fundingNeeded} onChange={(e) => setFormData({ ...formData, fundingNeeded: e.target.value })} fullWidth />
            <Input label="Founded Year" value={formData.foundedYear} onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })} fullWidth />
            <Input label="Team Size" value={formData.teamSize} onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })} fullWidth />

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                className="w-full border rounded-md px-3 py-2"
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Pitch Summary</label>
              <textarea
                className="w-full border rounded-md px-3 py-2"
                rows={4}
                value={formData.pitchSummary}
                onChange={(e) => setFormData({ ...formData, pitchSummary: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Startup History</label>
              <textarea
                className="w-full border rounded-md px-3 py-2"
                rows={4}
                value={formData.startupHistory}
                onChange={(e) => setFormData({ ...formData, startupHistory: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 flex justify-end">
              <Button onClick={handleSave}>Save Profile</Button>
            </div>
          </CardBody>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">About</h2>
            </CardHeader>
            <CardBody>
              <p className="text-gray-700">{entrepreneur.bio || 'No bio added yet.'}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Startup Overview</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium text-gray-900">Pitch Summary</h3>
                  <p className="text-gray-700 mt-1">
                    {entrepreneur.pitchSummary || 'No pitch summary added yet.'}
                  </p>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900">Startup History</h3>
                  <p className="text-gray-700 mt-1">
                    {entrepreneur.startupHistory || 'No startup history added yet.'}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Funding</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Current Round Target</span>
                  <p className="text-lg font-semibold text-gray-900">
                    {entrepreneur.fundingNeeded || 'Not specified'}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Industry</span>
                  <p className="text-md font-medium text-gray-900">
                    {entrepreneur.industry || 'Not specified'}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Team Size</span>
                  <p className="text-md font-medium text-gray-900">
                    {entrepreneur.teamSize || 1} people
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
