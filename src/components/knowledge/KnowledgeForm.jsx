import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  Button,
  Flex,
  Switch,
  FormHelperText,
  useToast,
  Spinner,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Tag,
  TagLabel,
  TagCloseButton,
  HStack,
  InputGroup,
  InputRightElement,
  IconButton
} from '@chakra-ui/react';
import { ArrowBackIcon, AddIcon } from '@chakra-ui/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiService } from '@/services';
import { useAuth } from '@/context/AuthContext';

const KnowledgeForm = () => {
  const { id } = useParams();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    documentType: 'ARTICLE',
    department: '',
    published: false,
    tags: []
  });
  
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');
  
  const toast = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (isEditMode) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await apiService.getKnowledgeDocumentById(id);
      
      if (error) {
        if (error.status === 403) {
          toast({
            title: 'Permission Denied',
            description: 'You do not have permission to edit this document',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          navigate('/knowledge');
        } else {
          throw new Error(error.message || 'Failed to fetch document');
        }
      } else if (data) {
        setFormData({
          title: data.title || '',
          content: data.content || '',
          documentType: data.documentType || 'ARTICLE',
          department: data.department || '',
          published: data.published || false,
          tags: data.tags || []
        });
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'Title is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (!formData.content.trim()) {
      toast({
        title: 'Content is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    if (!formData.department) {
      toast({
        title: 'Department is required',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      let response;
      
      if (isEditMode) {
        response = await apiService.updateKnowledgeDocument(id, formData, user.id);
      } else {
        response = await apiService.createKnowledgeDocument(formData, user.id);
      }
      
      const { error } = response;
      
      if (error) {
        if (error.status === 403) {
          toast({
            title: 'Permission Denied',
            description: `You do not have permission to ${isEditMode ? 'update' : 'create'} knowledge documents`,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        } else {
          throw new Error(error.message || `Failed to ${isEditMode ? 'update' : 'create'} document`);
        }
      } else {
        toast({
          title: `Document ${isEditMode ? 'updated' : 'created'}`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/knowledge');
      }
    } catch (error) {
      toast({
        title: `Error ${isEditMode ? 'updating' : 'creating'} document`,
        description: error.response?.data?.message || 'Something went wrong',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="500px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  return (
    <Box p={4}>
      <Breadcrumb mb={6}>
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/knowledge">Knowledge Base</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{isEditMode ? 'Edit Document' : 'New Document'}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">{isEditMode ? 'Edit Document' : 'New Document'}</Heading>
        <Button 
          leftIcon={<ArrowBackIcon />} 
          variant="outline" 
          onClick={() => navigate('/knowledge')}
        >
          Cancel
        </Button>
      </Flex>

      <Box 
        as="form" 
        onSubmit={handleSubmit}
        borderWidth="1px" 
        borderRadius="lg" 
        overflow="hidden" 
        p={6} 
        boxShadow="md"
        bg="white"
      >
        <FormControl mb={4} isRequired>
          <FormLabel>Title</FormLabel>
          <Input 
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Document title"
          />
        </FormControl>

        <FormControl mb={4} isRequired>
          <FormLabel>Content</FormLabel>
          <Textarea 
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Document content (supports Markdown)"
            minH="200px"
          />
          <FormHelperText>Markdown formatting is supported</FormHelperText>
        </FormControl>

        <Flex gap={4} mb={4} direction={{ base: 'column', md: 'row' }}>
          <FormControl isRequired>
            <FormLabel>Document Type</FormLabel>
            <Select 
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
            >
              <option value="ARTICLE">Article</option>
              <option value="FAQ">FAQ</option>
              <option value="TROUBLESHOOTING">Troubleshooting</option>
              <option value="POLICY">Policy</option>
              <option value="PROCEDURE">Procedure</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Department</FormLabel>
            <Select 
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Select department"
            >
              <option value="IT">IT</option>
              <option value="HR">HR</option>
              <option value="FINANCE">Finance</option>
              <option value="OPERATIONS">Operations</option>
              <option value="SALES">Sales</option>
              <option value="MARKETING">Marketing</option>
              <option value="CUSTOMER_SERVICE">Customer Service</option>
            </Select>
          </FormControl>
        </Flex>

        <FormControl mb={4}>
          <FormLabel>Tags</FormLabel>
          <InputGroup>
            <Input 
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              placeholder="Add tags and press Enter"
            />
            <InputRightElement>
              <IconButton
                icon={<AddIcon />}
                size="sm"
                onClick={addTag}
                aria-label="Add tag"
              />
            </InputRightElement>
          </InputGroup>
          <FormHelperText>Press Enter or click the + button to add a tag</FormHelperText>
          
          {formData.tags.length > 0 && (
            <HStack spacing={2} mt={2}>
              {formData.tags.map(tag => (
                <Tag key={tag} size="md" borderRadius="full" variant="solid" colorScheme="blue">
                  <TagLabel>{tag}</TagLabel>
                  <TagCloseButton onClick={() => removeTag(tag)} />
                </Tag>
              ))}
            </HStack>
          )}
        </FormControl>

        <FormControl display="flex" alignItems="center" mb={6}>
          <FormLabel htmlFor="published" mb="0">
            Published
          </FormLabel>
          <Switch 
            id="published"
            name="published"
            isChecked={formData.published}
            onChange={handleChange}
            colorScheme="green"
          />
          <FormHelperText ml={2}>
            {formData.published 
              ? 'Document will be visible to all users' 
              : 'Document is in draft mode and only visible to support staff'}
          </FormHelperText>
        </FormControl>

        <Flex justifyContent="flex-end" mt={6}>
          <Button 
            type="submit" 
            colorScheme="blue" 
            isLoading={isSaving}
            loadingText={isEditMode ? 'Updating' : 'Creating'}
          >
            {isEditMode ? 'Update Document' : 'Create Document'}
          </Button>
        </Flex>
      </Box>
    </Box>
  );
};

export default KnowledgeForm;
