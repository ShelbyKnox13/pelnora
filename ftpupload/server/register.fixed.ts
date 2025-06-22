app.post('/api/auth/register', async (req, res) => {
  try {
    const validatedData = insertUserSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(validatedData.email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(validatedData.password, salt);

    // Generate referral ID
    const referralId = 'REF' + crypto.randomBytes(4).toString('hex').toUpperCase();

    // Create user with validated data and required fields
    const newUser = await storage.createUser({
      ...validatedData,
      password: hashedPassword,
      referralId,
      role: 'user',
      isActive: true,
      isEmailVerified: true, // Set to true by default to bypass verification
      kycStatus: 'pending',
      isPhoneVerified: false
    });

    // Create package for the user if package type is provided
    if (req.body.packageType) {
      const selectedPackage = PACKAGES.find((p) => p.id === req.body.packageType);
      if (selectedPackage) {
        const validPackageTypes = ["basic", "silver", "gold", "platinum", "diamond"] as const;
        if (!validPackageTypes.includes(selectedPackage.id as any)) {
          throw new Error("Invalid package type");
        }
        const packageData = {
          userId: newUser.id,
          packageType: selectedPackage.id as typeof validPackageTypes[number],
          monthlyAmount: selectedPackage.monthlyAmount.toString(),
          totalMonths: 12
        };
        await storage.createPackage(packageData);
      }
    }

    // Return user data without password
    const userWithoutPassword = { ...newUser, password: undefined };
    return res.status(200).json({
      success: true,
      message: 'Registration successful',
      user: userWithoutPassword
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        success: false,
        message: error.errors[0].message 
      });
    }
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: error instanceof Error ? error.message : "Error creating user" 
    });
  }
});