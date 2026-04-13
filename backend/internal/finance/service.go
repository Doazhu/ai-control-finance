package finance

type Service struct {
	repo *Repository
}

func (s *Service) GetTransactions() []string {
	return []string{}
}
