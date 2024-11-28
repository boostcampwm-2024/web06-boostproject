import { useEffect, useRef, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { Harmony } from './logo';
import { Button } from './ui/button';
import { useAuth } from '@/features/auth/useAuth.ts';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CARDS = ['☕️', '8', '4', '2', '1'];

const truncateName = (name: string, maxLength: number) => {
  return name.length > maxLength ? `${name.slice(0, maxLength)}..` : name;
};

function ToggleCard({
  isExpanded,
  toggleExpand,
}: {
  isExpanded: boolean;
  toggleExpand: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <motion.div
        initial={{
          rotate: isExpanded ? 0 : -5 * CARDS.length,
        }}
        animate={{
          rotate: isExpanded ? 0 : -5 * CARDS.length,
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        whileHover={{ borderColor: 'rgb(2, 199, 90)' }}
        className="absolute h-[75px] w-[50px] cursor-pointer rounded-lg border bg-white shadow-lg"
        style={{ zIndex: CARDS.length }}
        onClick={toggleExpand}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <div className="relative flex h-full items-center justify-center text-black">
          <Harmony size={16} />
        </div>
      </motion.div>
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, x: 0 }}
            animate={{ opacity: 1, y: 0, x: -10 }}
            exit={{ opacity: 0, y: 10, x: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute right-[-60px] top-[-34px] whitespace-nowrap rounded-md bg-black px-2 py-1 text-sm text-white shadow-lg"
            style={{ zIndex: CARDS.length }}
          >
            {isExpanded ? 'Finish Planning Poker' : 'Start Planning Poker'}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

interface User {
  userId: number;
  name: string;
  selectedCard: string;
  profileImage: string;
}

function PlanningPokerFloatingButton() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const [selectedCard, setSelectedCard] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  const { project } = useParams({ from: '/_auth/$project' });
  const auth = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  const toggleExpand = () => {
    if (isExpanded && socketRef.current) {
      setUsers((prevUsers) => {
        const newUsers = [...prevUsers];
        newUsers.pop();
        return newUsers;
      });

      setSelectedCard('');

      socketRef.current.disconnect();
      socketRef.current = null;

      setIsExpanded(false);

      return;
    }

    if (!socketRef.current) {
      socketRef.current = io('http://223.130.147.122', {
        path: '/api/socket.io',
        auth: {
          token: auth.accessToken,
          projectId: project,
        },
        withCredentials: true,
      });

      socketRef.current.on(
        'user_joined',
        (data: { userId: number; username: string; profileImage: string }) => {
          setUsers((prevUsers) => [
            {
              userId: data.userId,
              name: data.username,
              selectedCard: '',
              profileImage: data.profileImage,
            },
            ...prevUsers,
          ]);
        }
      );

      socketRef.current.on('user_left', (data: { userId: number }) => {
        setUsers((prevUsers) => prevUsers.filter((user) => user.userId !== data.userId));
      });

      socketRef.current.on(
        'users_fetched',
        (data: {
          isRevealed: boolean;
          users: {
            userId: number;
            username: string;
            card: string;
            profileImage: string;
          }[];
        }) => {
          setUsers(
            data.users.map((user) => ({
              userId: user.userId,
              name: user.username,
              selectedCard: user.card,
              profileImage: user.profileImage,
            }))
          );
          setIsRevealed(data.isRevealed);
        }
      );

      socketRef.current.on('card_selected', (data: { userId: number }) => {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.userId === data.userId ? { ...user, selectedCard: 'SELECTED' } : user
          )
        );
      });

      socketRef.current.on('card_revealed', (data: { userId: number; card: string }[]) => {
        setUsers((prevUsers) =>
          prevUsers.map((user) => {
            const revealed = data.find((d) => d.userId === user.userId);
            return revealed ? { ...user, selectedCard: revealed.card } : user;
          })
        );
        setIsRevealed(true);
      });

      socketRef.current.on('card_reset', () => {
        setUsers((prevUsers) => prevUsers.map((user) => ({ ...user, selectedCard: '' })));
        setIsRevealed(false);
        setSelectedCard('');
      });
    }

    setIsExpanded(true);
  };

  const handleButtonClick = () => {
    if (!socketRef.current) {
      return;
    }

    if (isRevealed) {
      socketRef.current.emit('reset_card', { projectId: project });
      setUsers((prevUsers) => prevUsers.map((user) => ({ ...user, selectedCard: '' })));
      setIsRevealed(false);
      setSelectedCard('');
      return;
    }

    socketRef.current.emit('reveal_card', { projectId: project });
    setIsRevealed(true);
  };

  const handleCardClick = (card: string) => {
    if (!socketRef.current) {
      return;
    }
    if (isRevealed) {
      return;
    }

    setUsers((prevUsers) => {
      const newUsers = [...prevUsers];
      newUsers[newUsers.length - 1] = {
        ...newUsers[newUsers.length - 1],
        selectedCard: card,
      };
      return newUsers;
    });

    setSelectedCard(card);

    const currentUser = users[users.length - 1];
    socketRef.current.emit('select_card', { projectId: project, userId: currentUser.userId, card });
  };

  const anyoneSelected =
    users.some((user) => user.selectedCard === 'SELECTED') || selectedCard !== '';

  const getButtonText = () => {
    if (isRevealed) {
      return 'Start new voting';
    }
    if (anyoneSelected) {
      return 'Reveal cards';
    }
    return 'Pick your card';
  };

  return (
    <>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-32 right-12 z-50 flex flex-col gap-2"
          >
            <AnimatePresence>
              {users.map((user, index) => (
                <motion.div
                  key={user.userId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                  className="flex flex-row-reverse gap-2"
                >
                  <div className="flex w-9 flex-col items-center gap-1">
                    <Avatar className="h-8 w-8 rounded-full shadow">
                      <AvatarImage src={user.profileImage} className="object-cover" alt="Avatar" />
                      <AvatarFallback>
                        <div className="h-full w-full bg-gradient-to-br from-purple-600 via-fuchsia-500 to-pink-500" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-600">
                      {index === users.length - 1 ? 'Me' : truncateName(user.name, 4)}
                    </span>
                  </div>
                  <AnimatePresence>
                    {user.selectedCard && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          rotateY: isRevealed ? 0 : 180,
                        }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{
                          type: 'spring',
                          stiffness: 100,
                          damping: 15,
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border bg-white shadow"
                      >
                        {isRevealed ? (
                          <span className="text-sm text-black">{user.selectedCard}</span>
                        ) : (
                          <span className="text-sm text-gray-500 [transform:rotateY(180deg)]">
                            ?
                          </span>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
            <Button onClick={handleButtonClick} disabled={!isRevealed && !anyoneSelected}>
              {getButtonText()}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-28 right-24 z-50" role="button" aria-expanded={isExpanded}>
        <ToggleCard isExpanded={isExpanded} toggleExpand={toggleExpand} />
        {CARDS.map((card, index) => {
          const baseY = isExpanded ? 0 : -(index + 1) * 1;
          const isSelected = selectedCard === card;

          return (
            <motion.div
              key={card}
              initial={{
                rotate: isExpanded ? 0 : -5 * (CARDS.length - (index + 1)),
                y: baseY,
                x: isExpanded ? -(index + 1) * 60 : 0,
              }}
              animate={{
                rotate: isExpanded ? 0 : -5 * (CARDS.length - (index + 1)),
                y: isSelected ? baseY - 10 : baseY,
                x: isExpanded ? -(index + 1) * 60 : 0,
                scale: isSelected ? 1.1 : 1,
                borderColor: isSelected ? 'rgb(2, 199, 90)' : '#f0f0f0',
                backgroundColor: isSelected ? 'rgb(2, 199, 90)' : '#ffffff',
                color: isSelected ? '#ffffff' : '#000000',
                opacity: isRevealed ? 0.5 : 1,
              }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              whileHover={isRevealed ? {} : { scale: 1.1, y: -10, borderColor: 'rgb(2, 199, 90)' }}
              className={`absolute h-[75px] w-[50px] rounded-lg border shadow-lg ${isExpanded ? '' : 'pointer-events-none'} ${isRevealed ? 'pointer-events-none' : ''}`}
              style={{ zIndex: CARDS.length - (index + 1) }}
              onClick={() => handleCardClick(card)}
            >
              <div className="flex h-full items-center justify-center">{card}</div>
            </motion.div>
          );
        })}
      </div>
    </>
  );
}

export default PlanningPokerFloatingButton;
