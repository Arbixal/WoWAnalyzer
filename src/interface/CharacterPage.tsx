import NavigationBar from 'interface/NavigationBar';
import { useParams, useSearchParams } from 'react-router-dom';
import DocumentTitle from 'interface/DocumentTitle';

import CharacterParses from './CharacterParses';
import { usePageView } from './useGoogleAnalytics';

const CharacterPage = () => {
  const { region, realm, name } = useParams();
  const regionDecoded = decodeURI(region?.replace(/\+/g, ' ') ?? '').toUpperCase();
  const realmDecoded = decodeURI(realm?.replace(/\+/g, ' ') ?? '');
  const nameDecoded = decodeURI(name?.replace(/\+/g, ' ') ?? '');
  const [searchParams] = useSearchParams();
  const game = searchParams.get('game');
  usePageView('CharacterPage');
  return (
    <>
      <DocumentTitle title={`${nameDecoded}-${realmDecoded} (${regionDecoded})`} />

      <NavigationBar />

      <CharacterParses region={regionDecoded} realm={realmDecoded} name={nameDecoded} game={game} />
    </>
  );
};

export default CharacterPage;
