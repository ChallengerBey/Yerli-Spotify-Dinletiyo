'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  FileText, 
  Video, 
  Mic, 
  Image, 
  Download, 
  Play, 
  Pause, 
  Upload,
  Search,
  Folder,
  Eye,
  Calendar,
  FileIcon,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface MediaFile {
  id: string;
  name: string;
  type: 'pdf' | 'video' | 'audio' | 'image' | 'presentation';
  size: string;
  uploadDate: string;
  url: string;
  description?: string;
  category: 'sunum' | 'finansal' | 'teknik' | 'pazarlama' | 'demo';
}

export default function YatirimPage() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);

  // Gerçek dosyaları API'den yükle
  useEffect(() => {
    const loadFiles = async () => {
      try {
        const response = await fetch('/api/uploads');
        if (response.ok) {
          const data = await response.json();
          setFiles(data.files || []);
        } else {
          console.error('Dosyalar yüklenemedi');
          // Hata durumunda demo dosyalar
          setFiles([]);
        }
      } catch (error) {
        console.error('API hatası:', error);
        setFiles([]);
      }
    };

    loadFiles();
  }, []);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="h-8 w-8 text-red-500" />;
      case 'video':
        return <Video className="h-8 w-8 text-blue-500" />;
      case 'audio':
        return <Mic className="h-8 w-8 text-green-500" />;
      case 'image':
        return <Image className="h-8 w-8 text-purple-500" />;
      case 'presentation':
        return <FileIcon className="h-8 w-8 text-orange-500" />;
      default:
        return <FileIcon className="h-8 w-8 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'sunum':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'finansal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'teknik':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'pazarlama':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'demo':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || file.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (uploadedFiles) {
      Array.from(uploadedFiles).forEach(file => {
        const newFile: MediaFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type.includes('pdf') ? 'pdf' : 
                file.type.includes('video') ? 'video' :
                file.type.includes('audio') ? 'audio' :
                file.type.includes('image') ? 'image' : 'presentation',
          size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
          uploadDate: new Date().toISOString().split('T')[0],
          url: URL.createObjectURL(file),
          description: 'Yeni yüklenen dosya',
          category: 'sunum'
        };
        setFiles(prev => [newFile, ...prev]);
      });
    }
  };

  const categories = [
    { value: 'all', label: 'Tümü', count: files.length },
    { value: 'sunum', label: 'Sunumlar', count: files.filter(f => f.category === 'sunum').length },
    { value: 'finansal', label: 'Finansal', count: files.filter(f => f.category === 'finansal').length },
    { value: 'teknik', label: 'Teknik', count: files.filter(f => f.category === 'teknik').length },
    { value: 'pazarlama', label: 'Pazarlama', count: files.filter(f => f.category === 'pazarlama').length },
    { value: 'demo', label: 'Demo', count: files.filter(f => f.category === 'demo').length }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/home" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-6 w-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">💼 Yatırımcı Medya Merkezi</h1>
              <p className="text-muted-foreground">Sunumlar, finansal belgeler ve demo materyalleri</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="file"
              multiple
              accept=".pdf,.mp4,.mp3,.pptx,.docx,.jpg,.png"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload">
              <Button className="cursor-pointer" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Dosya Yükle
                </span>
              </Button>
            </label>
            <Link href="/rapor">
              <Button variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Arama ve Filtreler */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Dosya ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="flex items-center gap-2"
              >
                <Folder className="h-4 w-4" />
                {category.label}
                <Badge variant="secondary" className="ml-1">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Dosya Listesi */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-semibold text-foreground truncate">
                        {file.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={`text-xs ${getCategoryColor(file.category)}`}>
                          {file.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{file.size}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {file.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {file.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(file.uploadDate).toLocaleDateString('tr-TR')}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {file.type === 'audio' && (
                    <div className="flex-1">
                      <audio controls className="w-full h-8">
                        <source src={file.url} type="audio/mpeg" />
                        Tarayıcınız ses dosyasını desteklemiyor.
                      </audio>
                    </div>
                  )}
                  
                  {file.type === 'video' && (
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <Play className="h-4 w-4 mr-2" />
                        İzle
                      </a>
                    </Button>
                  )}
                  
                  {(file.type === 'pdf' || file.type === 'presentation') && (
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <a href={file.url} target="_blank" rel="noopener noreferrer">
                        <Eye className="h-4 w-4 mr-2" />
                        Görüntüle
                      </a>
                    </Button>
                  )}
                  
                  <Button size="sm" variant="ghost" asChild>
                    <a href={file.url} download={file.name}>
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <Folder className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Dosya bulunamadı</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Arama kriterlerinize uygun dosya yok.' : 'Henüz dosya yüklenmemiş.'}
            </p>
          </div>
        )}

        {/* Hızlı Erişim */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-foreground mb-4">🚀 Hızlı Erişim</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/rapor">
              <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <h3 className="font-semibold text-foreground">Canlı Analytics</h3>
                  <p className="text-sm text-muted-foreground">Gerçek zamanlı kullanıcı verileri</p>
                </CardContent>
              </Card>
            </Link>
            
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/20">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-2">💰</div>
                <h3 className="font-semibold text-foreground">Finansal Özet</h3>
                <p className="text-sm text-muted-foreground">Gelir ve büyüme projeksiyonları</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/20">
              <CardContent className="p-6 text-center">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-semibold text-foreground">Demo Platform</h3>
                <p className="text-sm text-muted-foreground">Canlı platform gösterimi</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}