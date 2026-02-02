-- Add target_weight to profiles
alter table public.profiles 
add column if not exists target_weight float;

-- Optional: Add policies or update function if needed, but standard update policy covers it.
