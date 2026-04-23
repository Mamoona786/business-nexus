import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Card, CardHeader, CardBody } from '../../components/ui/Card';
import { EntrepreneurCard } from '../../components/entrepreneur/EntrepreneurCard';
import { Entrepreneur } from '../../types';
import { getEntrepreneursApi } from '../../services/userService';

export const EntrepreneursPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEntrepreneurs = async () => {
      try {
        const response = await getEntrepreneursApi({
          search: searchQuery,
          industry: selectedIndustries.join(',')
        });
        setEntrepreneurs(response.users);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadEntrepreneurs();
  }, [searchQuery, selectedIndustries]);

  const allIndustries = Array.from(
    new Set(
      entrepreneurs
        .map((e) => e.industry)
        .filter((industry): industry is string => !!industry)
    )
  );

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries((prev) =>
      prev.includes(industry)
        ? prev.filter((i) => i !== industry)
        : [...prev, industry]
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Startups</h1>
        <p className="text-gray-600">Discover promising startups looking for investment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Industry</h3>
                <div className="space-y-2">
                  {allIndustries.map((industry) => (
                    <button
                      key={industry}
                      onClick={() => toggleIndustry(industry)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedIndustries.includes(industry)
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {industry}
                    </button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search startups by name, industry, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              startAdornment={<Search size={18} />}
              fullWidth
            />

            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm text-gray-600">
                {loading ? 'Loading...' : `${entrepreneurs.length} results`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {entrepreneurs.map((entrepreneur) => (
              <EntrepreneurCard
                key={entrepreneur.id}
                entrepreneur={entrepreneur}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
