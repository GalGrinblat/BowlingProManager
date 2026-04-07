import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { gamesApi } from '../../services/api/games';
import { useTranslation } from '../../contexts/LanguageContext';
import { GameViewLayout } from './game/GameViewLayout';
import type { Game } from '../../types/index';

export const CompletedGameView: React.FC = () => {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const location = useLocation();
  const { t } = useTranslation();
  const [game, setGame] = useState<Game | undefined>(location.state?.game);

  useEffect(() => {
    if (!game && gameId) {
      gamesApi.getById(gameId).then(data => {
        if (data) setGame(data);
      });
    }
  }, [gameId, game]);

  if (!game) return <div>{t('common.loading')}</div>;

  return <GameViewLayout game={game} onBack={() => navigate(-1)} />;
};
