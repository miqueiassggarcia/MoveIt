import { createContext, ReactNode, useEffect, useState } from "react";
import Cookies from "js-cookie";
import challenges from "../../challenges.json";
import { LevelUpModel } from "../components/LevelUpModal"
import { LinkinGithub } from "../components/LinkinGithub";

interface Challenge {
  type: "body" | "eye";
  description: string;
  amount: number;
}

interface ChallengesContextData {
  level: number;
  currentExperience: number;
  challengesCompleted: number;
  activeChallenge: Challenge;
  experienceToNextLevel: number;
  levelUp: () => void;
  startNewChallenge: () => void;
  resetChallenge: () => void;
  completeChallenge: () => void;
  closeLevelUpModal: () => void;
  addUserData: (name: string, github: string) => void;
}

interface ChallengesProviderProps {
  children: ReactNode;
  level: number;
  currentExperience: number;
  challengesCompleted: number;
}

export const ChallengesContext = createContext({} as ChallengesContextData);

export function ChallengesProvider({
  children,
  ...rest
}: ChallengesProviderProps) {
  const [level, setLevel] = useState(rest.level ?? 1);
  const [currentExperience, setCurrentExperience] = useState(rest.currentExperience ?? 0)
  const [challengesCompleted, setChallengesCompleted] = useState(rest.challengesCompleted ?? 0);

  const [activeChallenge, setActiveChallenge] = useState(null);
  const [isLevelUpModelOpen, setIsLevelUpModalOpen] = useState(false);

  const [username, setUsername] = useState("");
  const [userImage, setUserImage] = useState("");

  const experienceToNextLevel = Math.pow((level + 1)* 4, 2);

  useEffect(() => {
    Notification.requestPermission();
  }, [])

  useEffect(() => {
    Cookies.set('level', String(level));
    Cookies.set('currentExperience', String(currentExperience));
    Cookies.set('challengesCompleted', String(challengesCompleted));
  }, [level, currentExperience, challengesCompleted])

  useEffect(() => {
    Cookies.set('username', String(username));
    Cookies.set('userImage', String(userImage));
  }, [username, userImage])

  function levelUp() {
    setLevel(level + 1)
    setIsLevelUpModalOpen(true);
  }

  function closeLevelUpModal() {
    setIsLevelUpModalOpen(false)
  }

  function startNewChallenge() {
    const ramdomChallengeIndex = Math.floor(Math.random() * challenges.length);
    const challenge = challenges[ramdomChallengeIndex];

    setActiveChallenge(challenge);

    if (Notification.permission === "granted") {
      new Notification("Novo desafio 🎉",
        {body: `Valendo ${challenge.amount}`}
      )
      new Audio("/notification.oga").play();
    }
  }
  
  function resetChallenge() {
    setActiveChallenge(null);
  }

  function completeChallenge() {
    if (!activeChallenge) {
      return;
    }

    const { amount } = activeChallenge;

    let finalExperience = currentExperience + amount;

    if (finalExperience >= experienceToNextLevel) {
      finalExperience = finalExperience - experienceToNextLevel;
      levelUp();
    }

    setCurrentExperience(finalExperience);
    setActiveChallenge(null);
    setChallengesCompleted(challengesCompleted + 1);
  }

  function addUserData(name: string, github: string) {
    setUsername(name);
    setUserImage(`https://github.com/${github}`)
  }
  return (
    <ChallengesContext.Provider
      value={{
        level,
        currentExperience,
        challengesCompleted,
        levelUp,
        startNewChallenge,
        activeChallenge,
        resetChallenge,
        experienceToNextLevel,
        completeChallenge,
        closeLevelUpModal,
        addUserData,
      }}
    >
      {children}

      {isLevelUpModelOpen && <LevelUpModel />}

      {username != "" && <LinkinGithub />}
     </ChallengesContext.Provider>
  );
}