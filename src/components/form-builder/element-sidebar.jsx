'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Type, 
  Mail, 
  Hash, 
  FileText, 
  ChevronDown, 
  Circle, 
  CheckSquare, 
  Upload, 
  Calendar,
  Minus,
  Heading1,
  AlignLeft,
  Search,
  Phone,
  MapPin,
  Globe,
  Building,
  User,
  Camera,
  Link,
  Clock,
  DollarSign,
  Star,
  Shield,
  Users,
  Briefcase,
  Award,
  Eye,
  EyeOff,
  Palette,
  ToggleLeft,
  BookOpen,
  MessageSquare,
  Home,
  CreditCard,
  PenTool,
  FileImage,
  Video,
  Mic,
  Settings,
  Car,
  Lock
} from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { getApiWithParam } from '@/service/viewService';
import { toast } from 'sonner';
import { Button } from '../ui/button';



// icon pass as per field type
const fieldTypeIcons = {
  text: Type,
  email: Mail,
  url: Link,
  password: Lock,
  phone: Phone,
  number: Hash,
  date: Calendar,
};

// Dreaggable Element

export function DraggableElement({ element,index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
  } = useDraggable({
    id: `sidebar-${element?._id}`,
    data: element
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const Icon = fieldTypeIcons[element.fieldType] || Type;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="group p-2 2xl:p-3 bg-white border border-solid border-gray-200 rounded-md 2xl:rounded-lg cursor-grab shadow active:cursor-grabbing hover:border-blue-300 hover:shadow-sm transition-all duration-200 ease-in"
    >
      <div className="flex items-center space-x-1 2xl:space-x-2">
        <div className="flex-shrink-0">
          <Icon className="size-4 2xl:size-5 text-gray-600 group-hover:text-blue-600 transition-all duration-200 ease-in" />
        </div>
        <div className="flex-1 min-w-0 border-l border-solid border-gray-200 pl-2">
          <p className="text-sm font-medium text-gray-900 group-hover:text-blue-600">{element.fieldName}</p>         
        </div>
      </div>
    </div>
  );
}

/**
 * Element Group Component
 */
function ElementGroup({  elements, searchTerm }) {
  // Filter elements based on search term
  const filteredElements = elements.filter(element => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      element.fieldName.toLowerCase().includes(searchLower) ||
      element.fieldType.toLowerCase().includes(searchLower) ||
      element.keywords?.some(keyword => keyword.toLowerCase().includes(searchLower))
    );
  });

  if (filteredElements.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 mb-5">
      {/* <h3 className="text-sm font-semibold text-gray-700">{title}</h3> */}
      {filteredElements.map((element,index) => (
        <div key={index}>
        <DraggableElement key={index} element={element} index={index} />
        </div>
      ))}
    </div>
  );
}

/**
 * Element Sidebar Component
 */
export function ElementSidebar({form,onCreateelemet}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [defaultElement,setDefaultElement] = useState([]);
  
  useEffect(()=>{        
    elementFtch()
  },[])
  // fetch defualt field by user Type
  const elementFtch =async () =>{
    try{
      const element = await getApiWithParam('/get-default-userType',`${form?.userType}`)            
      if(element.status == 1){
        setDefaultElement(element.data.field)
      }
    }catch(err){
      console.error("🚨 Error fetching form:", err);
      toast.error("Failed to load form");
    }
      
  }

  // Filter elements based on search
  const searchResults = useMemo(() => {
    if (!searchTerm) return null;
    
    const searchLower = searchTerm.toLowerCase();
    return defaultElement.filter(element => 
      element.fieldName.toLowerCase().includes(searchLower) ||
      element.fieldType.toLowerCase().includes(searchLower) ||
      element.keywords?.some(keyword => keyword.toLowerCase().includes(searchLower))
    );
  }, [searchTerm, defaultElement]);

  function handelecreateElement(){
    onCreateelemet('date')
  }

  return (
    <div className="w-60 xl:w-80 bg-gray-50 border-r border-gray-200 relative z-10 flex flex-col">
      <Card className="border-0 rounded-none 2xl:p-4 grow !pb-16">
        <CardHeader className="px-0">
          <CardTitle className="text-sm font-semibold text-gray-700">Form Elements</CardTitle>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
            <Input placeholder="Search elements..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-9 2xl:h-11 2xl:text-base" />
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {searchResults ? (
            // Show search results
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Search Results ({searchResults.length})</h3>
              <div className="space-y-2">
                {searchResults.map((element,index) => (
                  <DraggableElement key={index} element={element} index={index}  />
                ))}
              </div>
              {searchResults.length === 0 && (<p className="text-sm text-gray-500 text-center py-8">No elements found matching "{searchTerm}"</p>)}
            </div>
          ) : (
            // Show all groups
           
          <ElementGroup                        
            elements={defaultElement}
            searchTerm={searchTerm}
          />
          )}
        </CardContent>
      </Card>
      <div className='shrink-0 w-60 xl:w-80 p-4 py-3 bg-white shadow-[0_-4px_4px_0_rgba(0,0,0,0.12)] fixed bottom-0 left-0'>
        <Button className={'w-full'} onClick={handelecreateElement}>Create field</Button>
      </div>
    </div>
  );
}
