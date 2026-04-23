import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MessageCircle, Building2, MapPin, UserCircle, BarChart3, Briefcase } from 'lucide-react';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';
import { Investor } from '../../types';
import { getUserByIdApi } from '../../services/userService';

export const InvestorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, updateProfile } = useAuth();

  const [investor, setInvestor] = useState<Investor | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    avatarUrl: '',
    location: '',
    minimumInvestment: '',
    maximumInvestment: '',
    totalInvestments: '',
    investmentHistory: '',
    investmentInterests: '',
    investmentStage: '',
    portfolioCompanies: ''
  });

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) return;

      try {
        const response = await getUserByIdApi(id);
        const fetchedUser = response.user as Investor;
        setInvestor(fetchedUser);

        setFormData({
          name: fetchedUser.name || '',
          bio: fetchedUser.bio || '',
          avatarUrl: fetchedUser.avatarUrl || '',
          location: fetchedUser.location || '',
          minimumInvestment: fetchedUser.minimumInvestment || '',
          maximumInvestment: fetchedUser.maximumInvestment || '',
          totalInvestments: String(fetchedUser.totalInvestments || 0),
          investmentHistory: fetchedUser.investmentHistory || '',
          investmentInterests: (fetchedUser.investmentInterests || []).join(', '),
          investmentStage: (fetchedUser.investmentStage || []).join(', '),
          portfolioCompanies: (fetchedUser.portfolioCompanies || []).join(', ')
        });
      } catch (error) {
        console.error(error);
      }
    };

    loadProfile();
  }, [id]);

  if (!investor || investor.role !== 'investor') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Investor not found</h2>
        <p className="text-gray-600 mt-2">The investor profile you are looking for does not exist.</p>
        <Link to="/dashboard/entrepreneur">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const isCurrentUser = currentUser?.id === investor.id;

  const handleSave = async () => {
    await updateProfile({
      name: formData.name,
      bio: formData.bio,
      avatarUrl: formData.avatarUrl,
      location: formData.location,
      minimumInvestment: formData.minimumInvestment,
      maximumInvestment: formData.maximumInvestment,
      totalInvestments: Number(formData.totalInvestments || 0),
      investmentHistory: formData.investmentHistory,
      investmentInterests: formData.investmentInterests
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      investmentStage: formData.investmentStage
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      portfolioCompanies: formData.portfolioCompanies
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    });

    setInvestor((prev) =>
      prev
        ? {
            ...prev,
            name: formData.name,
            bio: formData.bio,
            avatarUrl: formData.avatarUrl,
            location: formData.location,
            minimumInvestment: formData.minimumInvestment,
            maximumInvestment: formData.maximumInvestment,
            totalInvestments: Number(formData.totalInvestments || 0),
            investmentHistory: formData.investmentHistory,
            investmentInterests: formData.investmentInterests
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
            investmentStage: formData.investmentStage
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean),
            portfolioCompanies: formData.portfolioCompanies
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
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
              src={investor.avatarUrl}
              alt={investor.name}
              size="xl"
              className="mx-auto sm:mx-0"
            />

            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-gray-900">{investor.name}</h1>
              <p className="text-gray-600 flex items-center justify-center sm:justify-start mt-1">
                <Building2 size={16} className="mr-1" />
                Investor • {investor.totalInvestments || 0} investments
              </p>

              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
                {investor.location && (
                  <Badge variant="primary">
                    <MapPin size={14} className="mr-1" />
                    {investor.location}
                  </Badge>
                )}
                {(investor.investmentStage || []).map((stage, index) => (
                  <Badge key={index} variant="secondary" size="sm">{stage}</Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 sm:mt-0 flex flex-col sm:flex-row gap-2 justify-center sm:justify-end">
            {!isCurrentUser && (
              <Link to={`/chat/${investor.id}`}>
                <Button leftIcon={<MessageCircle size={18} />}>
                  Message
                </Button>
              </Link>
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
            <Input label="Minimum Investment" value={formData.minimumInvestment} onChange={(e) => setFormData({ ...formData, minimumInvestment: e.target.value })} fullWidth />
            <Input label="Maximum Investment" value={formData.maximumInvestment} onChange={(e) => setFormData({ ...formData, maximumInvestment: e.target.value })} fullWidth />
            <Input label="Total Investments" value={formData.totalInvestments} onChange={(e) => setFormData({ ...formData, totalInvestments: e.target.value })} fullWidth />
            <Input label="Investment Interests (comma separated)" value={formData.investmentInterests} onChange={(e) => setFormData({ ...formData, investmentInterests: e.target.value })} fullWidth />
            <Input label="Investment Stages (comma separated)" value={formData.investmentStage} onChange={(e) => setFormData({ ...formData, investmentStage: e.target.value })} fullWidth />

            <div className="md:col-span-2">
              <Input
                label="Portfolio Companies (comma separated)"
                value={formData.portfolioCompanies}
                onChange={(e) => setFormData({ ...formData, portfolioCompanies: e.target.value })}
                fullWidth
              />
            </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Investment History</label>
              <textarea
                className="w-full border rounded-md px-3 py-2"
                rows={4}
                value={formData.investmentHistory}
                onChange={(e) => setFormData({ ...formData, investmentHistory: e.target.value })}
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
              <p className="text-gray-700">{investor.bio || 'No bio added yet.'}</p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Investment Interests</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <h3 className="text-md font-medium text-gray-900">Industries</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(investor.investmentInterests || []).map((interest, index) => (
                      <Badge key={index} variant="primary" size="md">{interest}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900">Investment Stages</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(investor.investmentStage || []).map((stage, index) => (
                      <Badge key={index} variant="secondary" size="md">{stage}</Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-md font-medium text-gray-900">Investment History</h3>
                  <p className="text-gray-700 mt-2">
                    {investor.investmentHistory || 'No investment history added yet.'}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Portfolio Companies</h2>
              <span className="text-sm text-gray-500">
                {(investor.portfolioCompanies || []).length} companies
              </span>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(investor.portfolioCompanies || []).map((company, index) => (
                  <div key={index} className="flex items-center p-3 border border-gray-200 rounded-md">
                    <div className="p-3 bg-primary-50 rounded-md mr-3">
                      <Briefcase size={18} className="text-primary-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{company}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Investment Details</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Investment Range</span>
                  <p className="text-lg font-semibold text-gray-900">
                    {investor.minimumInvestment || 'Not set'} - {investor.maximumInvestment || 'Not set'}
                  </p>
                </div>

                <div>
                  <span className="text-sm text-gray-500">Total Investments</span>
                  <p className="text-md font-medium text-gray-900">
                    {investor.totalInvestments || 0} companies
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Investment Stats</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                <div className="p-3 border border-gray-200 rounded-md bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Portfolio Companies</h3>
                      <p className="text-xl font-semibold text-primary-700 mt-1">
                        {(investor.portfolioCompanies || []).length}
                      </p>
                    </div>
                    <BarChart3 size={24} className="text-primary-600" />
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};
