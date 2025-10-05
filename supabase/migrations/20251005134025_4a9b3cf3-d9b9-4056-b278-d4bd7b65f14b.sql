-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create passwords vault table
CREATE TABLE public.passwords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_name TEXT NOT NULL,
  username TEXT,
  encrypted_password TEXT NOT NULL,
  url TEXT,
  notes TEXT,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.passwords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own passwords"
  ON public.passwords FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own passwords"
  ON public.passwords FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own passwords"
  ON public.passwords FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own passwords"
  ON public.passwords FOR DELETE
  USING (auth.uid() = user_id);

-- Create cyber tips table
CREATE TABLE public.cyber_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT DEFAULT 'info',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cyber_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view cyber tips"
  ON public.cyber_tips FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample cyber tips
INSERT INTO public.cyber_tips (title, description, category, severity) VALUES
('Never Reuse Passwords', 'Using the same password across multiple sites puts all your accounts at risk if one gets breached.', 'passwords', 'high'),
('Enable Two-Factor Authentication', '2FA adds an extra layer of security by requiring a second form of verification beyond your password.', 'authentication', 'high'),
('Use Password Managers', 'Password managers help you create and store unique, complex passwords securely for all your accounts.', 'passwords', 'medium'),
('Watch for Phishing Emails', 'Be suspicious of unexpected emails asking for personal information or urging immediate action.', 'phishing', 'high'),
('Keep Software Updated', 'Regular updates patch security vulnerabilities that hackers could exploit.', 'general', 'medium'),
('Use HTTPS Websites', 'Always check for the padlock icon and https:// in the URL when entering sensitive information.', 'browsing', 'medium'),
('Avoid Public WiFi for Sensitive Tasks', 'Public networks are often unsecured, making it easier for attackers to intercept your data.', 'network', 'high'),
('Regular Backups Save Data', 'Regular backups protect you from ransomware attacks and accidental data loss.', 'general', 'medium'),
('Strong Passwords Matter', 'Use at least 12 characters with a mix of uppercase, lowercase, numbers, and symbols.', 'passwords', 'high'),
('Be Careful What You Share', 'Limit personal information on social media as it can be used for identity theft or social engineering attacks.', 'privacy', 'medium');

-- Create cyber knowledge articles table
CREATE TABLE public.cyber_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  reading_time INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cyber_knowledge ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view knowledge articles"
  ON public.cyber_knowledge FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample knowledge articles
INSERT INTO public.cyber_knowledge (title, content, category, reading_time) VALUES
('Understanding Phishing Attacks', 'Phishing is a cybercrime where attackers impersonate legitimate organizations to steal sensitive information. Learn to identify suspicious emails, verify sender addresses, and never click on unknown links. Key signs include urgent language, spelling errors, and requests for personal information.', 'phishing', 5),
('Malware: Types and Prevention', 'Malware includes viruses, trojans, ransomware, and spyware. Protect yourself by installing reputable antivirus software, avoiding suspicious downloads, and keeping your system updated. Always scan USB drives and email attachments before opening them.', 'malware', 7),
('Data Breaches: What You Need to Know', 'Data breaches expose personal information like passwords and credit card numbers. Check if your accounts have been compromised using breach notification services. Change passwords immediately if affected and enable 2FA on all important accounts.', 'data-breach', 6),
('VPN and Encryption Basics', 'VPNs create encrypted tunnels for your internet traffic, protecting your data from prying eyes. Essential for public WiFi usage, VPNs also help maintain privacy and bypass geographic restrictions. Choose reputable VPN providers with no-logs policies.', 'vpn', 8),
('Safe Internet Practices', 'Practice safe browsing by using strong passwords, avoiding suspicious websites, and being cautious with downloads. Keep your browser and plugins updated, use ad-blockers to prevent malicious ads, and always log out of accounts when finished.', 'best-practices', 6);

-- Create cyber crime cases table
CREATE TABLE public.cyber_crime_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date TEXT,
  impact TEXT,
  lessons TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cyber_crime_cases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view crime cases"
  ON public.cyber_crime_cases FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample cyber crime cases
INSERT INTO public.cyber_crime_cases (title, description, date, impact, lessons) VALUES
('Yahoo Data Breach', 'One of the largest data breaches in history affecting 3 billion user accounts. Attackers gained access to names, email addresses, phone numbers, and hashed passwords.', '2013-2014', 'Massive compromise of user data, leading to identity theft and account takeovers.', 'Always use unique passwords for each service and enable 2FA. Companies must implement robust security measures and be transparent about breaches.'),
('WannaCry Ransomware Attack', 'Global ransomware attack that encrypted files on infected computers and demanded Bitcoin payments. Affected over 200,000 computers across 150 countries.', 'May 2017', 'Healthcare systems, businesses, and governments were paralyzed. Estimated damages exceeded $4 billion globally.', 'Keep systems updated with security patches. Maintain regular backups. Implement network segmentation to prevent spread.'),
('Indian UPI Fraud Cases', 'Increasing cases of UPI fraud where attackers trick users into sharing OTPs or scanning malicious QR codes, leading to unauthorized transactions.', '2020-Present', 'Individual victims losing thousands of rupees through social engineering tactics.', 'Never share OTPs with anyone. Verify payment requests before approving. Use screen lock and enable transaction limits.'),
('Colonial Pipeline Attack', 'Ransomware attack on US fuel pipeline operator, causing fuel shortages and panic buying across the East Coast.', 'May 2021', 'Operations shut down for days. $4.4 million ransom paid. Highlighted vulnerability of critical infrastructure.', 'Critical infrastructure needs robust cybersecurity. Have incident response plans ready. Isolate OT networks from IT networks.');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_passwords_updated_at
  BEFORE UPDATE ON public.passwords
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();