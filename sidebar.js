import React, { useState, useEffect } from 'react';
import client, { databases, DATABASE_ID, COLLECTION_ID_CHANNELS } from '../appwrite/appwriteConfig';
import { ID, Query } from 'appwrite';
import { useAuth } from '../utils/AuthContext';

const Sidebar = ({ setCurrentChannel, currentChannel }) => {
    const [channels, setChannels] = useState([]);
    const [channelName, setChannelName] = useState('');
    const { user } = useAuth();

    useEffect(() => {
        const getChannels = async () => {
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID_CHANNELS,
                    [Query.orderDesc('$createdAt')]
                );
                setChannels(response.documents);
            } catch (error) {
                console.error('Error fetching channels:', error);
            }
        };

        getChannels();

        const unsubscribe = client.subscribe(
            `databases.${DATABASE_ID}.collections.${COLLECTION_ID_CHANNELS}.documents`,
            response => {
                if (response.events.includes('databases.*.collections.*.documents.*.create')) {
                    setChannels(prevState => [response.payload, ...prevState]);
                }
                if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
                    setChannels(prevState => prevState.filter(channel => channel.$id !== response.payload.$id));
                    if (currentChannel && currentChannel.$id === response.payload.$id) {
                        setCurrentChannel(null);
                    }
                }
            }
        );

        return () => {
            unsubscribe();
        };
    }, [currentChannel, setCurrentChannel]);

    const createChannel = async (e) => {
        e.preventDefault();
        const currentTime = new Date().toISOString();
        const payload = {
            name: channelName,
            created_at: currentTime,
            created_by: user.$id
        };
        try {
            await databases.createDocument(
                DATABASE_ID,
                COLLECTION_ID_CHANNELS,
                ID.unique(),
                payload
            );
            setChannelName('');
        } catch (error) {
            console.error('Error creating channel:', error);
        }
    };

    const deleteChannel = async (id) => {
        try {
            await databases.deleteDocument(DATABASE_ID, COLLECTION_ID_CHANNELS, id);
            setChannels(prevState => prevState.filter(channel => channel.$id !== id));
            if (currentChannel && currentChannel.$id === id) {
                setCurrentChannel(null);
            }
        } catch (error) {
            console.error('Error deleting channel:', error);
        }
    };

    return (
        <div className="sidebar">
            <h2>Channels</h2>
            <form onSubmit={createChannel}>
                <input
                    type="text"
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="New Channel Name"
                    required
                />
                <button type="submit">Create</button>
            </form>
            <ul>
                {channels.map(channel => (
                    <li key={channel.$id}>
                        <span onClick={() => setCurrentChannel(channel)}>{channel.name}</span>
                        {channel.created_by === user.$id && (
                            <button onClick={() => deleteChannel(channel.$id)}>Delete</button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
