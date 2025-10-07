import { User } from "@/types/user";
import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "./supabase";

export const checkUser = async (): Promise<User | null> => {
    const user = await currentUser();
    if (!user) {
        console.warn("No authenticated user found.");
        return null;
    }
    
    try {
        // Destructure response dari maybeSingle()
        const { data: existingUser, error: fetchError } = await supabase
            .from("users") 
            .select('*, social_links(*)')
            .eq("clerk_user_id", user.id)
            .maybeSingle();

        if (fetchError) {
            // maybeSingle() should NOT error for 0 rows, tapi tetap tangani error lain
            console.error("Error fetching user:", fetchError);
            return null;
        }

        // Jika user sudah ada -> langsung return
        if (existingUser) {
            return existingUser as User;
        }

        // Insert ke tabel users
        const { data: createdUser, error: userError } = await supabase
            .from("users")
            .insert([
                {
                    clerk_user_id: user.id,
                    email: user.emailAddresses?.[0]?.emailAddress ?? "",
                    name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || null,
                    avatar_url: user.imageUrl ?? null,
                },
            ])
            .select()
            .single();

        if (userError) {
            console.error("Error creating user:", userError);
            return null;
        }

        return (createdUser as User) ?? null;
    } catch (err) {
        console.error("Unexpected error in checkUser:", err);
        return null;
    }
};

export const findById = async (id: string): Promise<User | null> => {
    try {
        const { data: user, error } = await supabase
            .from("users")
            .select("*, social_links(*)")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error fetching user:", error);
            return null;
        }
        return user as User;
    } catch (err) {
        console.error("Unexpected error in findById:", err);
        return null;
    }
}