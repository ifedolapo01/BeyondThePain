"use client";

import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  serverTimestamp,
  collectionGroup,
  where
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'stories' | 'resources' | 'comments';
type ViewMode = 'active' | 'archived';

interface ModerateItem {
  id: string;
  type: Tab;
  title?: string;
  content?: string; // Full content for resources
  story?: string;   // Full content for stories
  snippet?: string;
  authorName?: string;
  status?: string;
  moderationReason?: string;
  category?: string;
  isComment?: boolean;
  parentStoryId?: string;
}

interface CommentItem {
  id: string;
  authorName: string;
  content: string;
  status?: string;
  moderationReason?: string;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('stories');
  const [viewMode, setViewMode] = useState<ViewMode>('active');
  const [items, setItems] = useState<ModerateItem[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  
  // Detail View State
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [storyComments, setStoryComments] = useState<CommentItem[]>([]);
  const [isFetchingComments, setIsFetchingComments] = useState(false);

  // Archiving State
  const [archiveTarget, setArchiveTarget] = useState<{id: string, type: string, parentStoryId?: string} | null>(null);
  const [reason, setReason] = useState('');
  const [isArchiving, setIsArchiving] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const router = useRouter();

  // Auth Check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/admin/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  // Data Fetching
  useEffect(() => {
    if (!user) return;
    fetchData();
    setExpandedItemId(null); // Reset expansion when changing tabs or views
  }, [user, activeTab, viewMode]);

  // Handle tab visibility logic
  useEffect(() => {
    if (viewMode === 'active' && activeTab === 'comments') {
      setActiveTab('stories');
    }
  }, [viewMode, activeTab]);

  // Fetch comments when a story is expanded
  useEffect(() => {
    if (expandedItemId && activeTab === 'stories') {
      fetchStoryComments(expandedItemId);
    }
  }, [expandedItemId, activeTab]);

  const fetchData = async () => {
    setIsFetching(true);
    setFetchError(null);
    try {
      let fetchedItems: ModerateItem[] = [];
      
      if (activeTab === 'comments') {
        // Only fetch archived comments for this tab
        try {
          const commentsQ = query(collectionGroup(db, "comments"), where("status", "==", "archived"));
          const commentsSnap = await getDocs(commentsQ);
          commentsSnap.forEach(docSnap => {
            const data = docSnap.data();
            const pathParts = docSnap.ref.path.split('/');
            const storyId = pathParts[1];
            
            fetchedItems.push({
              id: docSnap.id,
              type: 'stories',
              isComment: true,
              parentStoryId: storyId,
              ...data as any
            });
          });
        } catch (err) {
          console.error("Error fetching archived comments:", err);
        }
      } else {
        const collectionName = activeTab === 'stories' ? "stories" : "resources";
        const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        
        snap.forEach(docSnap => {
          const data = docSnap.data();
          const isArchived = data.status === 'archived';
          
          if ((viewMode === 'active' && !isArchived) || (viewMode === 'archived' && isArchived)) {
            fetchedItems.push({
              id: docSnap.id,
              type: activeTab,
              ...data as any
            });
          }
        });
      }

      // Sort results by createdAt if available
      fetchedItems.sort((a: any, b: any) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      
      setItems(fetchedItems);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      if (error.code === 'failed-precondition' || error.message?.includes('index')) {
        setFetchError("This query requires a Firestore index. Please check your browser console for the direct link to create it, or wait a few minutes if you just created it.");
      } else {
        setFetchError("Failed to fetch data from the database.");
      }
    } finally {
      setIsFetching(false);
    }
  };

  const fetchStoryComments = async (storyId: string) => {
    setIsFetchingComments(true);
    try {
      const q = query(collection(db, "stories", storyId, "comments"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const comments: CommentItem[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        comments.push({
          id: docSnap.id,
          ...data as any
        });
      });
      setStoryComments(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setIsFetchingComments(false);
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget || !reason.trim()) return;
    setIsArchiving(true);
    try {
      let docRef;
      if (archiveTarget.type === 'stories') {
        docRef = doc(db, "stories", archiveTarget.id);
      } else if (archiveTarget.type === 'resources') {
        docRef = doc(db, "resources", archiveTarget.id);
      } else if (archiveTarget.type === 'comment' && archiveTarget.parentStoryId) {
        docRef = doc(db, "stories", archiveTarget.parentStoryId, "comments", archiveTarget.id);
      }

      if (docRef) {
        await updateDoc(docRef, {
          status: 'archived',
          moderationReason: reason.trim(),
          moderatedAt: serverTimestamp(),
          moderatedBy: user.uid
        });
        
        // Update UI
        if (archiveTarget.type === 'comment') {
          setStoryComments(storyComments.map(c => 
            c.id === archiveTarget.id ? { ...c, status: 'archived', moderationReason: reason.trim() } : c
          ));
        } else {
          setItems(items.filter(item => item.id !== archiveTarget.id));
          setExpandedItemId(null);
        }
        
        setArchiveTarget(null);
        setReason('');
      }
    } catch (error) {
      console.error("Error archiving:", error);
      alert("Failed to archive item.");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/admin/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-black text-gray-900 leading-none">Moderation <span className="text-accent">Desk</span></h1>
          <p className="text-gray-500 mt-2">Managing community health and safety</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <div className="hidden sm:block text-right px-2">
            <p className="text-xs font-bold text-gray-900">{user.email}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">Admin Access</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-5 py-2.5 bg-gray-50 hover:bg-red-50 hover:text-red-600 rounded-xl text-sm font-bold transition-all"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1.5 rounded-2xl w-fit">
          {(['stories', 'resources', 'comments'] as Tab[])
            .filter(tab => tab !== 'comments' || viewMode === 'archived')
            .map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === tab 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-white items-center p-1 rounded-2xl border border-gray-100 shadow-sm">
          <button
            onClick={() => setViewMode('active')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'active' 
                ? 'bg-green-50 text-green-700' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setViewMode('archived')}
            className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'archived' 
                ? 'bg-red-50 text-red-700' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            Archived
          </button>
        </div>
      </div>

      {/* Content List */}
      <div className="space-y-4 min-h-[400px]">
        {isFetching ? (
          <div className="bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent mb-4"></div>
            <p className="text-gray-400 font-medium">Scanning database...</p>
          </div>
        ) : fetchError ? (
          <div className="bg-red-50 rounded-3xl border border-red-100 p-12 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-red-900 mb-2">Database Index Required</h3>
            <p className="text-red-700 text-sm max-w-md mx-auto mb-6">
              {fetchError}
            </p>
            <button 
              onClick={() => fetchData()}
              className="px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all"
            >
              Retry Connection
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-100 flex flex-col items-center justify-center py-32 text-center px-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No {viewMode === 'active' ? 'published' : 'archived'} {activeTab} yet</h3>
            <p className="text-gray-500 max-w-sm">Everything looks clean in this section.</p>
          </div>
        ) : (
          items.map((item) => (
            <motion.div 
              key={item.id}
              layout
              className={`bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300 ${
                expandedItemId === item.id ? 'ring-2 ring-accent/20 border-accent/20' : 'hover:shadow-md'
              }`}
            >
              <div className="p-6">
                <div className="flex justify-between items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="text-[10px] uppercase tracking-widest font-black px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                        {item.isComment ? 'comment' : activeTab === 'stories' ? 'story' : 'resource'} ID: {item.id.slice(0, 8)}
                      </span>
                      {item.isComment && (
                        <span className="text-[10px] uppercase tracking-widest font-black px-2 py-1 bg-red-50 text-red-600 rounded-md">
                          Archived Comment
                        </span>
                      )}
                      {(item.authorName) && (
                        <span className="text-xs font-bold text-gray-400">by {item.authorName}</span>
                      )}
                    </div>
                    
                    {item.isComment && item.parentStoryId && (
                      <p className="text-[10px] text-gray-400 font-bold mb-2 uppercase tracking-wide">
                        Parent Story: <span className="text-gray-600">{item.parentStoryId}</span>
                      </p>
                    )}
                    
                    {item.title && <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">{item.title}</h3>}
                    <p className={`text-gray-600 text-sm leading-relaxed max-w-3xl ${expandedItemId === item.id ? '' : 'line-clamp-2'}`}>
                      {item.content || item.story || item.snippet}
                    </p>
                    
                    {item.moderationReason && (
                      <div className="mt-4 p-4 bg-red-50/50 border border-red-100 rounded-2xl">
                        <p className="text-[10px] uppercase tracking-widest font-black text-red-500 mb-1">Moderation Reason</p>
                        <p className="text-red-700 text-sm italic">"{item.moderationReason}"</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                      className="px-4 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-bold transition-all whitespace-nowrap"
                    >
                      {expandedItemId === item.id ? 'Close' : 'Read Full'}
                    </button>
                    {viewMode === 'active' && (
                      <button
                        onClick={() => setArchiveTarget({id: item.id, type: item.type})}
                        className="px-4 py-2 bg-white border border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-100 rounded-xl text-xs font-bold transition-all"
                      >
                        Archive
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded View Content (Comments for stories) */}
                <AnimatePresence>
                  {expandedItemId === item.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-8 pt-8 border-t border-gray-50"
                    >
                      {item.type === 'stories' ? (
                        <div>
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">User Comments</h4>
                            <span className="text-[10px] text-gray-400 font-bold">{storyComments.length} Total</span>
                          </div>

                          {isFetchingComments ? (
                            <div className="py-8 flex justify-center">
                              <div className="animate-spin h-6 w-6 border-b-2 border-accent/20 rounded-full"></div>
                            </div>
                          ) : storyComments.length === 0 ? (
                            <p className="text-gray-400 text-sm italic py-4">No comments found for this story.</p>
                          ) : (
                            <div className="space-y-4">
                              {storyComments.map(comment => (
                                <div 
                                  key={comment.id}
                                  className={`p-4 rounded-2xl border transition-all ${
                                    comment.status === 'archived' 
                                      ? 'bg-red-50/20 border-red-100 opacity-70' 
                                      : 'bg-gray-50/30 border-gray-100 hover:bg-gray-50/50'
                                  }`}
                                >
                                  <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-black text-gray-900">{comment.authorName}</span>
                                        {comment.status === 'archived' && (
                                          <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[8px] uppercase font-black rounded">Archived</span>
                                        )}
                                      </div>
                                      <p className="text-gray-600 text-sm">{comment.content}</p>
                                      {comment.moderationReason && (
                                        <p className="mt-2 text-[10px] text-red-500 italic">Reason: {comment.moderationReason}</p>
                                      )}
                                    </div>
                                    
                                    {comment.status !== 'archived' && (
                                      <button 
                                        onClick={() => setArchiveTarget({id: comment.id, type: 'comment', parentStoryId: item.id})}
                                        className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-tighter"
                                      >
                                        Archive
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gray-50/50 p-6 rounded-2xl">
                          <p className="text-xs text-gray-400 uppercase tracking-widest font-black mb-2">Category: {item.category}</p>
                          <p className="text-gray-700 text-sm leading-relaxed">{item.content}</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Archive Reason Modal */}
      <AnimatePresence>
        {archiveTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8"
            >
              <h2 className="text-2xl font-black text-gray-900 mb-2">Reason for removal</h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Please state why this {archiveTarget.type} is being archived. This will be stored for audit purposes.
              </p>
              
              <textarea
                autoFocus
                placeholder="Content is demeaning, harmful language, off-topic..."
                className="w-full h-32 p-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all text-sm mb-6"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setArchiveTarget(null);
                    setReason('');
                  }}
                  className="flex-1 py-4 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleArchive}
                  disabled={!reason.trim() || isArchiving}
                  className="flex-[2] py-4 bg-red-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {isArchiving ? "Archiving..." : "Confirm Archive"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
