import { useEffect } from 'react';
import { useRouter } from 'expo-router';

import ReceiveSharingIntentModule from 'react-native-receive-sharing-intent';

type FileType = {
  text: string | null;
  weblink: string | null;
};

const useGetShare = () => {
  const router = useRouter();

  useEffect(() => {
    ReceiveSharingIntentModule.getReceivedFiles(
      (file: FileType[]) => {
        try {
          const { text, weblink } = file[0];

          if (!text && !weblink) return;

          const link = (weblink || text) as string;
          router.replace({ pathname: '/research', params: { link: encodeURIComponent(link) } });
        } catch {}
      },
      (error: any) => {},
      'com.sigonggan.pickforme.share'
    );
  }, []);
};

export default useGetShare;
