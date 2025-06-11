-- Create a new storage bucket for contribution graphs
insert into storage.buckets (id, name, public) 
values ('contribution-graphs', 'contribution-graphs', true);

-- Enable RLS
alter table storage.objects enable row level security;

-- Create a policy that allows anyone to read objects
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'contribution-graphs' );

-- Create a policy that allows anyone to insert objects
create policy "Public Upload"
on storage.objects for insert
with check ( bucket_id = 'contribution-graphs' );

-- Create a policy that allows anyone to update objects
create policy "Public Update"
on storage.objects for update
using ( bucket_id = 'contribution-graphs' );

-- Create a policy that allows anyone to delete objects
create policy "Public Delete"
on storage.objects for delete
using ( bucket_id = 'contribution-graphs' ); 