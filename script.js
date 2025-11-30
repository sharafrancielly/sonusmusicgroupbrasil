document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('inscricaoForm');
    const outrosCheckbox = document.getElementById('outros');
    const outrosEspecificacao = document.getElementById('outrosEspecificacao');
    const telefoneInput = document.getElementById('telefone');
    const comoConheceuSelect = document.getElementById('comoConheceu');
    const outrosComoConheceu = document.getElementById('outrosComoConheceu');
    const instagramInput = document.getElementById('instagram');
    
    // Configuração do SheetDB - SUA CHAVE JÁ ESTÁ AQUI!
    const SHEETDB_URL = 'https://sheetdb.io/api/v1/go1hkg33ethki';
    
    // Inicialmente ocultar os campos de especificação
    outrosEspecificacao.style.display = 'none';
    outrosComoConheceu.style.display = 'none';
    
    // Mostrar/ocultar campo de especificação para "Outros" gêneros musicais
    outrosCheckbox.addEventListener('change', function() {
        outrosEspecificacao.style.display = this.checked ? 'inline-block' : 'none';
        if (!this.checked) outrosEspecificacao.value = '';
    });
    
    // Mostrar/ocultar campo de especificação para "Outros" em como conheceu
    comoConheceuSelect.addEventListener('change', function() {
        if (this.value === 'Outros') {
            outrosComoConheceu.style.display = 'block';
            outrosComoConheceu.required = true;
        } else {
            outrosComoConheceu.style.display = 'none';
            outrosComoConheceu.required = false;
            outrosComoConheceu.value = '';
            clearError('comoConheceuError');
        }
    });
    
    // Máscara para telefone
    telefoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length <= 10) {
            value = value.replace(/(\d{2})(\d{0,4})(\d{0,4})/, '($1) $2-$3');
        } else {
            value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        }
        
        e.target.value = value;
    });
    
    // Função para mostrar erro
    function showError(fieldId, message) {
        const errorElement = document.getElementById(fieldId + 'Error');
        const fieldElement = document.getElementById(fieldId);
        
        if (errorElement && fieldElement) {
            errorElement.textContent = message;
            fieldElement.classList.add('error');
            
            // Rolando para o primeiro campo com erro
            if (!form.querySelector('.error')) {
                fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
    
    // Função para limpar erro
    function clearError(fieldId) {
        const errorElement = document.getElementById(fieldId);
        const fieldElement = document.getElementById(fieldId.replace('Error', ''));
        
        if (errorElement && fieldElement) {
            errorElement.textContent = '';
            fieldElement.classList.remove('error');
        }
    }
    
    // Validação de URL do Instagram
    function validateInstagram(url) {
        if (!url) return false;
        
        // Regex para validar URL do Instagram
        const instagramRegex = /^(https?:\/\/)?(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/;
        return instagramRegex.test(url);
    }
    
    // Funções auxiliares para formatar os dados
    function getGenerosMusicais() {
        const generos = Array.from(document.querySelectorAll('input[name="generoMusical"]:checked'))
                            .map(cb => cb.value);
        
        // Se "Outros" foi selecionado, adicionar a especificação
        if (generos.includes('Outros') && document.getElementById('outrosEspecificacao').value) {
            const outrosIndex = generos.indexOf('Outros');
            generos[outrosIndex] = 'Outros: ' + document.getElementById('outrosEspecificacao').value;
        }
        
        return generos.join(', ');
    }
    
    function getVertente() {
        const vertente = document.querySelector('input[name="vertente"]:checked');
        return vertente ? vertente.value : 'Não selecionado';
    }
    
    function getComoConheceu() {
        let comoConheceu = document.getElementById('comoConheceu').value;
        if (comoConheceu === 'Outros' && document.getElementById('outrosComoConheceu').value) {
            comoConheceu += ' - ' + document.getElementById('outrosComoConheceu').value;
        }
        return comoConheceu;
    }
    
    // Validação de campos obrigatórios
    function validateForm() {
        let isValid = true;
        
        // Limpar todos os erros
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
        document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
        
        // Validar campos de texto obrigatórios
        const requiredFields = [
            'nomeCompleto', 'nomeArtistico', 'idade', 'cidadeEstado', 
            'telefone', 'email', 'instagram', 'videoApresentacao'
        ];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                showError(fieldId, 'Este campo é obrigatório');
                isValid = false;
            }
        });
        
        // Validar email
        const emailField = document.getElementById('email');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailField.value && !emailRegex.test(emailField.value)) {
            showError('email', 'Por favor, insira um email válido');
            isValid = false;
        }
        
        // Validar Instagram
        const instagramField = document.getElementById('instagram');
        if (instagramField.value && !validateInstagram(instagramField.value)) {
            showError('instagram', 'Por favor, insira um link válido do Instagram');
            isValid = false;
        }
        
        // Validar gênero musical (pelo menos um selecionado)
        const generos = document.querySelectorAll('input[name="generoMusical"]:checked');
        if (generos.length === 0) {
            showError('generoMusical', 'Selecione pelo menos um gênero musical');
            isValid = false;
        }
        
        // Validar se "Outros" foi selecionado e especificado
        if (outrosCheckbox.checked && !outrosEspecificacao.value.trim()) {
            showError('generoMusical', 'Por favor, especifique o gênero musical');
            isValid = false;
        }
        
        // Validar vertente (radio button)
        const vertente = document.querySelector('input[name="vertente"]:checked');
        if (!vertente) {
            showError('vertente', 'Selecione uma vertente do movimento');
            isValid = false;
        }
        
        // Validar como conheceu
        if (!comoConheceuSelect.value) {
            showError('comoConheceu', 'Selecione como conheceu o movimento');
            isValid = false;
        }
        
        // Validar se "Outros" foi selecionado em como conheceu
        if (comoConheceuSelect.value === 'Outros' && !outrosComoConheceu.value.trim()) {
            showError('comoConheceu', 'Por favor, especifique como conheceu o movimento');
            isValid = false;
        }
        
        // Validar termos
        const termos = document.getElementById('termos');
        if (!termos.checked) {
            showError('termos', 'Você deve aceitar os termos para continuar');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Adicionar validação em tempo real para campos obrigatórios
    document.querySelectorAll('input[required], select[required]').forEach(field => {
        field.addEventListener('blur', function() {
            if (!this.value.trim()) {
                showError(this.id, 'Este campo é obrigatório');
            } else {
                clearError(this.id + 'Error');
            }
        });
    });
    
    // Validação específica para email
    document.getElementById('email').addEventListener('blur', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value && !emailRegex.test(this.value)) {
            showError('email', 'Por favor, insira um email válido');
        } else if (this.value) {
            clearError('emailError');
        }
    });
    
    // Validação específica para Instagram
    document.getElementById('instagram').addEventListener('blur', function() {
        if (this.value && !validateInstagram(this.value)) {
            showError('instagram', 'Por favor, insira um link válido do Instagram');
        } else if (this.value) {
            clearError('instagramError');
        }
    });
    
    // Função para salvar na planilha via SheetDB
    async function salvarNaPlanilha(formData) {
        const dadosPlanilha = {
            data: new Date().toLocaleString('pt-BR'),
            nomecompleto: formData.nomeCompleto,
            nomeartistico: formData.nomeArtistico,
            idade: formData.idade,
            cidadeestado: formData.cidadeEstado,
            telefone: formData.telefone,
            email: formData.email,
            instagram: formData.instagram,
            generomusical: formData.generoMusical,
            vertente: formData.vertente,
            videoapresentacao: formData.videoApresentacao,
            comoconheceu: formData.comoConheceu
        };
    
        try {
            console.log('Enviando dados para SheetDB:', dadosPlanilha);
            
            const response = await fetch(SHEETDB_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ data: dadosPlanilha })
            });
    
            if (response.ok) {
                const result = await response.json();
                console.log('Dados salvos com sucesso!', result);
                return true;
            } else {
                const errorText = await response.text();
                console.error('Erro na resposta:', errorText);
                return false;
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            return false;
        }
    }
    
    // Envio do formulário
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            try {
                // Mostrar loading no botão
                const submitBtn = document.querySelector('.btn-submit');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Enviando...';
                submitBtn.disabled = true;
                
                // Coletar dados do formulário
                const formData = {
                    nomeCompleto: document.getElementById('nomeCompleto').value,
                    nomeArtistico: document.getElementById('nomeArtistico').value,
                    idade: document.getElementById('idade').value,
                    cidadeEstado: document.getElementById('cidadeEstado').value,
                    telefone: document.getElementById('telefone').value,
                    email: document.getElementById('email').value,
                    instagram: document.getElementById('instagram').value,
                    generoMusical: getGenerosMusicais(),
                    vertente: getVertente(),
                    videoApresentacao: document.getElementById('videoApresentacao').value,
                    comoConheceu: getComoConheceu()
                };
    
                console.log('Dados do formulário:', formData);
                
                // Salvar na planilha
                const salvou = await salvarNaPlanilha(formData);
                
                if (salvou) {
                    // Mostrar mensagem de sucesso
                    document.getElementById('successMessage').style.display = 'block';
                    document.getElementById('successMessage').scrollIntoView({ behavior: 'smooth' });
                    
                    // Limpar formulário
                    form.reset();
                    
                    console.log('Formulário enviado com sucesso!');
                    
                } else {
                    alert('Erro ao salvar inscrição. Tente novamente.');
                }
    
            } catch (error) {
                console.error('Erro no envio:', error);
                alert('Erro ao enviar inscrição. Tente novamente.');
            } finally {
                // Restaurar botão
                const submitBtn = document.querySelector('.btn-submit');
                if (submitBtn) {
                    submitBtn.textContent = 'Enviar Inscrição';
                    submitBtn.disabled = false;
                }
            }
        } else {
            // Rolar para o primeiro campo com erro
            const firstError = form.querySelector('.error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
});