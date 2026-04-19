app.use(express.json());
// app.use(cors({...}));
app.use(cookieParser());

app.use('/api/auth', authRoutes);

app.use(notFound);
app.use(errorHandler);
