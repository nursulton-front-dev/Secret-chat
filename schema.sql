-- 1. Ambient Sounds Table (Public Read)
create table public.ambient_sounds (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text not null, -- 'nature', 'mechanical', etc.
  icon_name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.ambient_sounds enable row level security;

-- Policy: Everyone can read sounds
create policy "Allow public read access"
on public.ambient_sounds for select
to public
using (true);

-- 2. Secure Logs Table (Private)
create table public.secure_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null default auth.uid(),
  content_encrypted text not null, -- Base64 encoded ciphertext
  iv text not null, -- Base64 encoded Initialization Vector
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.secure_logs enable row level security;

-- Policy: Users can only see their own logs
create policy "Users can see own logs"
on public.secure_logs for select
to authenticated
using (auth.uid() = user_id);

-- Policy: Users can insert their own logs
create policy "Users can insert own logs"
on public.secure_logs for insert
to authenticated
with check (auth.uid() = user_id);

-- Optional: Dummy Data for Sounds
insert into public.ambient_sounds (name, type, icon_name)
values 
('Heavy Rain', 'nature', 'CloudRain'),
('Keyboard Clatter', 'mechanical', 'Keyboard'),
('Server Room', 'drone', 'Server');
