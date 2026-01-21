import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Google OAuth sign-in
export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: window.location.origin,
        },
    });
    if (error) throw error;
    return data;
};

// GitHub OAuth sign-in
export const signInWithGithub = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
            redirectTo: window.location.origin,
        },
    });
    if (error) throw error;
    return data;
};

// Facebook OAuth sign-in
export const signInWithFacebook = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
            redirectTo: window.location.origin,
        },
    });
    if (error) throw error;
    return data;
};

// Email/password login
export const loginWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    if (error) throw error;
    return data;
};

// Email/password registration
export const registerWithEmail = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });
    if (error) throw error;
    return data;
};

// Sign out
export const logoutUser = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

// Auth state change listener
export const onAuthChange = (callback) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
            callback(session?.user || null, session);
        }
    );
    return () => subscription.unsubscribe();
};

// Get current session
export const getSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
};

// Get access token from current session
export const getAccessToken = async () => {
    const session = await getSession();
    return session?.access_token || null;
};
