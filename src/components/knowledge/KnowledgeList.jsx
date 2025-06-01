import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  SimpleGrid, 
  Input, 
  Select, 
  Button, 
  Flex, 
  Badge, 
  Card, 
  CardBody, 
  CardHeader, 
  CardFooter,
  IconButton,
  useToast,
  Spinner,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  InputGroup,
  InputLeftElement
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, EditIcon, DeleteIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '@/services';
import { useAuth } from '@/context/AuthContext';

const KnowledgeList = () => {
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [filterDepartment, setFilterDepartment] = useState('ALL');
  const [showPublishedOnly, setShowPublishedOnly] = useState(true);
  
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'ADMIN';
  const isSupport = user?.role === 'SUPPORT' || isAdmin;

  useEffect(() => {
    fetchDocuments();
  }, [showPublishedOnly]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await apiService.getKnowledgeDocuments(showPublishedOnly);
      
      if (error) {
        if (error.status === 403) {
          toast({
            title: 'Permission Denied',
            description: 'You do not have permission to access knowledge documents',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } else {
          throw new Error(error.message || 'Failed to fetch knowledge documents');
        }
      } else {
        setDocuments(data || []);
        setFilteredDocs(data || []);
      }
    } catch (error) {
      toast({
        title: 'Error fetching knowledge documents',
        description: error.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [searchQuery, filterType, filterDepartment, documents]);

  const applyFilters = () => {
    let filtered = [...documents];
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
      );
    }
    
    // Apply type filter
    if (filterType !== 'ALL') {
      filtered = filtered.filter(doc => doc.documentType === filterType);
    }
    
    // Apply department filter
    if (filterDepartment !== 'ALL') {
      filtered = filtered.filter(doc => doc.department === filterDepartment);
    }
    
    setFilteredDocs(filtered);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleTypeFilter = (e) => {
    setFilterType(e.target.value);
  };

  const handleDepartmentFilter = (e) => {
    setFilterDepartment(e.target.value);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const { error } = await apiService.deleteKnowledgeDocument(id);
        
        if (error) {
          if (error.status === 403) {
            toast({
              title: 'Permission Denied',
              description: 'You do not have permission to delete knowledge documents',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          } else {
            throw new Error(error.message || 'Failed to delete document');
          }
        } else {
          toast({
            title: 'Document deleted',
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
          fetchDocuments();
        }
      } catch (error) {
        toast({
          title: 'Error deleting document',
          description: error.message || 'Something went wrong',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const getDocumentTypeColor = (type) => {
    switch (type) {
      case 'ARTICLE': return 'blue';
      case 'FAQ': return 'green';
      case 'TROUBLESHOOTING': return 'orange';
      case 'POLICY': return 'purple';
      case 'PROCEDURE': return 'teal';
      default: return 'gray';
    }
  };

  const getDepartmentColor = (department) => {
    switch (department) {
      case 'IT': return 'red';
      case 'HR': return 'green';
      case 'FINANCE': return 'blue';
      case 'OPERATIONS': return 'orange';
      case 'SALES': return 'purple';
      case 'MARKETING': return 'pink';
      case 'CUSTOMER_SERVICE': return 'teal';
      default: return 'gray';
    }
  };

  return (
    <Box p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Knowledge Base</Heading>
        {isSupport && (
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            onClick={() => navigate('/knowledge/new')}
          >
            New Document
          </Button>
        )}
      </Flex>

      <Flex 
        direction={{ base: 'column', md: 'row' }} 
        gap={4} 
        mb={6}
        wrap="wrap"
      >
        <Flex flex="3" alignItems="center">
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.500" />
            </InputLeftElement>
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={handleSearch}
            />
          </InputGroup>
        </Flex>
        
        <Flex flex="2" gap={4} wrap="wrap">
          <Select value={filterType} onChange={handleTypeFilter}>
            <option value="ALL">All Types</option>
            <option value="ARTICLE">Articles</option>
            <option value="FAQ">FAQs</option>
            <option value="TROUBLESHOOTING">Troubleshooting</option>
            <option value="POLICY">Policies</option>
            <option value="PROCEDURE">Procedures</option>
          </Select>
          
          <Select value={filterDepartment} onChange={handleDepartmentFilter}>
            <option value="ALL">All Departments</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="FINANCE">Finance</option>
            <option value="OPERATIONS">Operations</option>
            <option value="SALES">Sales</option>
            <option value="MARKETING">Marketing</option>
            <option value="CUSTOMER_SERVICE">Customer Service</option>
          </Select>
        </Flex>
        
        {isSupport && (
          <Button 
            variant="outline" 
            onClick={() => setShowPublishedOnly(!showPublishedOnly)}
          >
            {showPublishedOnly ? 'Show All' : 'Published Only'}
          </Button>
        )}
      </Flex>

      {isLoading ? (
        <Flex justify="center" align="center" h="300px">
          <Spinner size="xl" />
        </Flex>
      ) : filteredDocs.length === 0 ? (
        <Box textAlign="center" p={8}>
          <Text fontSize="lg">No documents found</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {filteredDocs.map(doc => (
            <Card 
              key={doc.id} 
              boxShadow="md" 
              borderRadius="lg" 
              cursor="pointer" 
              onClick={() => navigate(`/knowledge/${doc.id}`)}
              _hover={{ transform: 'translateY(-2px)', transition: 'all 0.2s' }}
              opacity={doc.published ? 1 : 0.7}
            >
              <CardHeader pb={2}>
                <Flex justify="space-between" align="center">
                  <Heading size="md" noOfLines={1}>{doc.title}</Heading>
                  {isSupport && (
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<ChevronDownIcon />}
                        variant="ghost"
                        size="sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <MenuList>
                        <MenuItem 
                          icon={<EditIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/knowledge/edit/${doc.id}`);
                          }}
                        >
                          Edit
                        </MenuItem>
                        <MenuItem 
                          icon={<DeleteIcon />}
                          color="red.500"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(doc.id);
                          }}
                        >
                          Delete
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  )}
                </Flex>
              </CardHeader>
              
              <CardBody py={2}>
                <Text noOfLines={3}>{doc.content}</Text>
              </CardBody>
              
              <CardFooter pt={2} flexWrap="wrap">
                <Flex gap={2} wrap="wrap">
                  <Badge colorScheme={getDocumentTypeColor(doc.documentType)}>
                    {doc.documentType.replace('_', ' ')}
                  </Badge>
                  
                  <Badge colorScheme={getDepartmentColor(doc.department)}>
                    {doc.department.replace('_', ' ')}
                  </Badge>
                  
                  {!doc.published && (
                    <Badge colorScheme="red">Draft</Badge>
                  )}
                  
                  {doc.tags && doc.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} colorScheme="gray" variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </Flex>
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default KnowledgeList;
