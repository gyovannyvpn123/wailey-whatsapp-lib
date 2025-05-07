/**
 * Wailey-library Multi-File Auth State
 * 
 * Definițiile TypeScript pentru funcția useMultiFileAuthState
 */

/**
 * Implementare pentru stocarea și gestionarea stării de autentificare în mai multe fișiere
 * @param folder - Directorul în care se va stoca starea de autentificare
 * @returns Starea de autentificare și funcția de salvare
 */
export declare function useMultiFileAuthState(folder: string): Promise<{
  state: {
    creds: any;
    keys: any;
  };
  saveCreds: () => void;
}>;