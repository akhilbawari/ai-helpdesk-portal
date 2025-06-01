import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Badge,
  Button,
  Flex,
  Spinner,
  useToast,
  Divider,
  IconButton,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Card,
  CardBody,
  Stack
} from '@chakra-ui/react';
import { ArrowBackIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import ReactMarkdown from 'react-markdown';

const KnowledgeDetail = () => {
  const { id } = useParams();
  const [document, setDocument] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [relatedDocs, setRelatedDocs] = useState([]);
  
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'ADMIN';
  const isSupport = user?.role === 'SUPPORT' || isAdmin;

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await apiService.getKnowledgeDocumentById(id);
      
      if (error) {
        if (error.status === 403) {
          toast({
            title: 'Permission Denied',
            description: 'You do not have permission to view this document',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          navigate('/knowledge');
        } else {
          throw new Error(error.message || 'Failed to fetch document');
        }
      } else if (data) {
        setDocument(data);
        
        // Fetch related documents based on tags
        if (data.tags && data.tags.length > 0) {
          fetchRelatedDocuments(data);
        }
      }
    } catch (error) {
      toast({
        title: 'Error fetching document',
        description: error.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      navigate('/knowledge');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedDocuments = async (doc) => {
    try {
      // Use the first tag to find related documents
      const tag = doc.tags[0];
      const { data: relatedData, error } = await apiService.getKnowledgeDocumentsByTag(tag, true);
      
      if (error) {
        console.error('Error fetching related documents:', error);
      } else {
        // Filter out the current document
        setRelatedDocs((relatedData || []).filter(relDoc => relDoc.id !== doc.id).slice(0, 3));
      }
    } catch (error) {
      console.error('Error fetching related documents:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        const { error } = await apiService.deleteKnowledgeDocument(id);
        
        if (error) {
          if (error.status === 403) {
            toast({
              title: 'Permission Denied',
              description: 'You do not have permission to delete this document',
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
          navigate('/knowledge');
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

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="500px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!document) {
    return (
      <Box textAlign="center" p={8}>
        <Heading size="md">Document not found</Heading>
        <Button mt={4} onClick={() => navigate('/knowledge')}>
          Back to Knowledge Base
        </Button>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Breadcrumb mb={6}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/knowledge">Knowledge Base</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{document.title}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Button 
          leftIcon={<ArrowBackIcon />} 
          variant="outline" 
          onClick={() => navigate('/knowledge')}
        >
          Back
        </Button>
        
        {isSupport && (
          <Flex gap={2}>
            <IconButton
              icon={<EditIcon />}
              aria-label="Edit document"
              onClick={() => navigate(`/knowledge/edit/${id}`)}
            />
            <IconButton
              icon={<DeleteIcon />}
              aria-label="Delete document"
              colorScheme="red"
              onClick={handleDelete}
            />
          </Flex>
        )}
      </Flex>

      <Box 
        borderWidth="1px" 
        borderRadius="lg" 
        overflow="hidden" 
        p={6} 
        boxShadow="md"
        bg="white"
      >
        <Heading size="lg" mb={2}>{document.title}</Heading>
        
        <Flex gap={2} mb={4} flexWrap="wrap">
          <Badge colorScheme={getDocumentTypeColor(document.documentType)}>
            {document.documentType.replace('_', ' ')}
          </Badge>
          
          <Badge colorScheme={getDepartmentColor(document.department)}>
            {document.department.replace('_', ' ')}
          </Badge>
          
          {!document.published && (
            <Badge colorScheme="red">Draft</Badge>
          )}
          
          {document.tags && document.tags.map(tag => (
            <Badge key={tag} colorScheme="gray" variant="outline">
              {tag}
            </Badge>
          ))}
        </Flex>
        
        <Divider mb={4} />
        
        <Box className="markdown-content" fontSize="md" lineHeight="tall">
          <ReactMarkdown>{document.content}</ReactMarkdown>
        </Box>
        
        <Flex mt={6} justifyContent="space-between" fontSize="sm" color="gray.600">
          <Text>Created: {new Date(document.createdAt).toLocaleDateString()}</Text>
          <Text>Last updated: {new Date(document.updatedAt).toLocaleDateString()}</Text>
        </Flex>
      </Box>

      {relatedDocs.length > 0 && (
        <Box mt={8}>
          <Heading size="md" mb={4}>Related Documents</Heading>
          <Stack spacing={4}>
            {relatedDocs.map(relDoc => (
              <Card 
                key={relDoc.id} 
                variant="outline" 
                cursor="pointer"
                onClick={() => navigate(`/knowledge/${relDoc.id}`)}
                _hover={{ bg: 'gray.50' }}
              >
                <CardBody>
                  <Heading size="sm" mb={2}>{relDoc.title}</Heading>
                  <Flex gap={2}>
                    <Badge colorScheme={getDocumentTypeColor(relDoc.documentType)} size="sm">
                      {relDoc.documentType.replace('_', ' ')}
                    </Badge>
                    <Badge colorScheme={getDepartmentColor(relDoc.department)} size="sm">
                      {relDoc.department.replace('_', ' ')}
                    </Badge>
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default KnowledgeDetail;
