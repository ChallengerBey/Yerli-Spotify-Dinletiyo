"use client";

import { useState } from "react";
import { MeetNew } from "./meet-new";
import { EnhancedFriendList } from "./enhanced-friend-list";

export function UserDiscovery({ currentUserId, currentUserName }: { currentUserId: string; currentUserName: string }) {
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const handleFriendAdded = () => {
        // Trigger a refresh of the friend list
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div className="space-y-6">
            <MeetNew currentUserId={currentUserId} onAdd={handleFriendAdded} />
            <EnhancedFriendList 
                currentUserId={currentUserId} 
                currentUserName={currentUserName}
                refreshTrigger={refreshTrigger} 
            />
        </div>
    );
}
